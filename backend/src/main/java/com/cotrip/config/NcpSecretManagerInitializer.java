package com.cotrip.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class NcpSecretManagerInitializer implements EnvironmentPostProcessor {

    private static final String API_URL = "https://secretmanager.apigw.ntruss.com";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String activeProfile = environment.getProperty("spring.profiles.active", "dev");
        if (!"prod".equals(activeProfile)) {
            return;
        }

        String accessKey = environment.getProperty("NCP_ACCESS_KEY");
        String secretKey = environment.getProperty("NCP_SECRET_KEY");
        String secretId = environment.getProperty("NCP_SECRET_ID");

        if (accessKey == null || secretKey == null || secretId == null) {
            System.err.println("[SecretManager] NCP_ACCESS_KEY, NCP_SECRET_KEY, NCP_SECRET_ID 환경변수가 필요합니다.");
            return;
        }

        try {
            Map<String, String> secrets = fetchSecrets(accessKey, secretKey, secretId);
            Map<String, Object> properties = new HashMap<>(secrets);
            environment.getPropertySources().addFirst(new MapPropertySource("ncp-secret-manager", properties));
            System.out.println("[SecretManager] " + secrets.size() + "개의 시크릿을 로드했습니다.");
        } catch (Exception e) {
            throw new RuntimeException("[SecretManager] 시크릿 로드 실패: " + e.getMessage(), e);
        }
    }

    private Map<String, String> fetchSecrets(String accessKey, String secretKey, String secretId) throws Exception {
        String method = "GET";
        String uri = "/api/v1/secrets/" + secretId + "/values";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String signature = makeSignature(method, uri, timestamp, accessKey, secretKey);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL + uri))
                .header("x-ncp-apigw-timestamp", timestamp)
                .header("x-ncp-iam-access-key", accessKey)
                .header("x-ncp-apigw-signature-v2", signature)
                .GET()
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Secret Manager API 응답 오류 (HTTP " + response.statusCode() + "): " + response.body());
        }

        return parseSecrets(response.body());
    }

    private Map<String, String> parseSecrets(String json) {
        Map<String, String> result = new HashMap<>();
        // active 필드에서 이스케이프된 JSON 문자열 추출
        Pattern activePattern = Pattern.compile("\"active\"\\s*:\\s*\"(\\{.*?\\})\"");
        Matcher activeMatcher = activePattern.matcher(json);
        if (activeMatcher.find()) {
            String innerJson = activeMatcher.group(1).replace("\\\"", "\"");
            Pattern kvPattern = Pattern.compile("\"([^\"]+)\"\\s*:\\s*\"([^\"]*)\"");
            Matcher kvMatcher = kvPattern.matcher(innerJson);
            while (kvMatcher.find()) {
                result.put(kvMatcher.group(1), kvMatcher.group(2));
            }
        }
        return result;
    }

    private String makeSignature(String method, String uri, String timestamp, String accessKey, String secretKey) throws Exception {
        String message = method + " " + uri + "\n" + timestamp + "\n" + accessKey;
        SecretKeySpec signingKey = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(signingKey);
        byte[] rawHmac = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(rawHmac);
    }
}
