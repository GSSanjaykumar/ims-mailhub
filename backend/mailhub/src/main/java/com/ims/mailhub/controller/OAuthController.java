package com.ims.mailhub.controller;

import com.ims.mailhub.model.User;
import com.ims.mailhub.repository.UserRepository;
import com.ims.mailhub.service.GmailOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/oauth2")
@CrossOrigin(origins = "http://localhost:5173")
public class OAuthController {

    @Autowired
    private GmailOAuthService gmailOAuthService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/authorize")
    public ResponseEntity<Map<String, String>> authorize() {
        String url = gmailOAuthService.getAuthorizationUrl("1");
        return ResponseEntity.ok(Map.of("authUrl", url));
    }

    @GetMapping("/callback")
    public void callback(@RequestParam String code,
                         @RequestParam(required = false) String state,
                         HttpServletResponse response) throws IOException {
        Map<String, String> tokens = gmailOAuthService.exchangeCodeForTokens(code);

        User user = userRepository.findById(1L).orElseThrow();
        user.setGmailRefreshToken(tokens.get("refresh_token"));
        user.setGmailAccessToken(tokens.get("access_token"));
        user.setTokenExpiry(System.currentTimeMillis() + 3600000);
        userRepository.save(user);

        response.sendRedirect("http://localhost:5173?gmail=connected");
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        try {
            User user = userRepository.findById(1L).orElseThrow();
            boolean connected = user.getGmailRefreshToken() != null
                && !user.getGmailRefreshToken().isEmpty();
            return ResponseEntity.ok(Map.of(
                "connected", connected,
                "email", connected ? user.getEmail() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "connected", false,
                "email", ""
            ));
        }
    }
}
