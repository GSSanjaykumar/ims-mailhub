package com.ims.mailhub.service;

import com.ims.mailhub.model.User;
import com.ims.mailhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class GmailSyncService {

    @Autowired
    private GmailOAuthService gmailOAuthService;

    @Autowired
    private EmailProcessorService emailProcessorService;

    @Autowired
    private UserRepository userRepository;

    public int syncLatestEmails() {
        User user = userRepository.findById(1L).orElseThrow(
            () -> new RuntimeException("User not found"));

        if (user.getGmailRefreshToken() == null || user.getGmailRefreshToken().isEmpty()) {
            throw new RuntimeException("Gmail not connected. Please connect Gmail first.");
        }

        // Check if access token is expired
        String accessToken = user.getGmailAccessToken();
        if (user.getTokenExpiry() == null || System.currentTimeMillis() >= user.getTokenExpiry()) {
            accessToken = gmailOAuthService.refreshAccessToken(user.getGmailRefreshToken());
            user.setGmailAccessToken(accessToken);
            user.setTokenExpiry(System.currentTimeMillis() + 3600000);
            userRepository.save(user);
        }

        // Fetch unread emails
        List<Map<String, Object>> gmailMessages = gmailOAuthService.fetchUnreadEmails(accessToken, 10);

        int count = 0;
        for (Map<String, Object> msg : gmailMessages) {
            String gmailId = (String) msg.get("gmailId");
            String sender = (String) msg.get("senderEmail");
            String senderName = (String) msg.get("senderName");
            String subject = (String) msg.get("subject");
            String body = (String) msg.get("body");

            var saved = emailProcessorService.processGmail(
                gmailId, sender, senderName, subject, body, 1L);
            if (saved != null) count++;

            // Rate limit: 20 second delay between emails for Gemini free tier
            try {
                Thread.sleep(20000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }

        return count;
    }
}
