package com.cotrip.ncp;

public record NearbyPlaceResponse(
        String name,
        String category,
        String address,
        String roadAddress,
        String telephone
) {}
