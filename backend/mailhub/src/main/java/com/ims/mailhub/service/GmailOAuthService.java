package com.ims.mailhub.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GmailOAuthService {

    @Value("${gmail.client.id}")
    private String clientId;

    @Value("${gmail.client.secret}")
    private String clientSecret;

    @Value("${gmail.redirect.uri}")
    private String redirectUri;

    private static final String AUTH_URI = "https://accounts.google.com/o/oauth2/auth";
    private static final String TOKEN_URI = "https://oauth2.googleapis.com/token";
    private static final List<String> SCOPES = Arrays.asList(
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/calendar"
    );

    public String getAuthorizationUrl(String userId) {
        return AUTH_URI + "?client_id=" + clientId
            + "&redirect_uri=" + redirectUri
            + "&response_type=code"
            + "&scope=" + String.join(" ", SCOPES)
            + "&access_type=offline"
            + "&prompt=consent"
            + "&state=" + userId;
    }

    @SuppressWarnings("unchecked")
    public Map<String, String> exchangeCodeForTokens(String code) {
        RestTemplate rt = new RestTemplate();
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

        Map<String, Object> response = rt.postForObject(TOKEN_URI, entity, Map.class);

        Map<String, String> result = new HashMap<>();
        result.put("access_token", (String) response.get("access_token"));
        result.put("refresh_token", response.get("refresh_token") != null
            ? (String) response.get("refresh_token") : "");
        return result;
    }

    @SuppressWarnings("unchecked")
    public String refreshAccessToken(String refreshToken) {
        RestTemplate rt = new RestTemplate();
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("refresh_token", refreshToken);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("grant_type", "refresh_token");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

        Map<String, Object> response = rt.postForObject(TOKEN_URI, entity, Map.class);
        return (String) response.get("access_token");
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchUnreadEmails(String accessToken, int maxResults) {
        RestTemplate rt = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        String listUrl = "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=" + maxResults;
        ResponseEntity<Map> listResponse = rt.exchange(listUrl, HttpMethod.GET, entity, Map.class);
        List<Map<String, Object>> messages = (List<Map<String, Object>>) listResponse.getBody().get("messages");

        if (messages == null) return new ArrayList<>();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> msg : messages) {
            String msgId = (String) msg.get("id");
            String detailUrl = "https://gmail.googleapis.com/gmail/v1/users/me/messages/" + msgId + "?format=full";
            ResponseEntity<Map> detail = rt.exchange(detailUrl, HttpMethod.GET, entity, Map.class);
            result.add(parseGmailMessage(detail.getBody()));
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseGmailMessage(Map<String, Object> raw) {
        Map<String, Object> parsed = new HashMap<>();
        parsed.put("gmailId", raw.get("id"));
        Map<String, Object> payload = (Map<String, Object>) raw.get("payload");
        List<Map<String, String>> headers = (List<Map<String, String>>) payload.get("headers");
        for (Map<String, String> h : headers) {
            String name = h.get("name");
            String value = h.get("value");
            if ("Subject".equalsIgnoreCase(name)) parsed.put("subject", value);
            if ("From".equalsIgnoreCase(name)) {
                if (value.contains("<")) {
                    parsed.put("senderName", value.substring(0, value.indexOf("<")).trim());
                    parsed.put("senderEmail", value.substring(value.indexOf("<") + 1, value.indexOf(">")));
                } else {
                    parsed.put("senderEmail", value);
                    parsed.put("senderName", value);
                }
            }
            if ("Date".equalsIgnoreCase(name)) parsed.put("date", value);
        }
        String body = extractBody(payload);
        parsed.put("body", body);
        return parsed;
    }

    @SuppressWarnings("unchecked")
    private String extractBody(Map<String, Object> payload) {
        List<Map<String, Object>> parts = (List<Map<String, Object>>) payload.get("parts");
        if (parts != null) {
            for (Map<String, Object> part : parts) {
                String mimeType = (String) part.get("mimeType");
                if ("text/plain".equals(mimeType) || "text/html".equals(mimeType)) {
                    Map<String, Object> body = (Map<String, Object>) part.get("body");
                    String data = (String) body.get("data");
                    if (data != null) return new String(Base64.getUrlDecoder().decode(data));
                }
                // Handle nested multipart
                List<Map<String, Object>> subParts = (List<Map<String, Object>>) part.get("parts");
                if (subParts != null) {
                    for (Map<String, Object> subPart : subParts) {
                        String subMime = (String) subPart.get("mimeType");
                        if ("text/plain".equals(subMime) || "text/html".equals(subMime)) {
                            Map<String, Object> body = (Map<String, Object>) subPart.get("body");
                            String data = (String) body.get("data");
                            if (data != null) return new String(Base64.getUrlDecoder().decode(data));
                        }
                    }
                }
            }
        }
        Map<String, Object> body = (Map<String, Object>) payload.get("body");
        if (body != null) {
            String data = (String) body.get("data");
            if (data != null) return new String(Base64.getUrlDecoder().decode(data));
        }
        return "";
    }
}
