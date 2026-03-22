package com.ims.mailhub.service;

import org.jsoup.Jsoup;
import org.springframework.stereotype.Service;

@Service
public class EmailCleanerService {

    public String clean(String rawHtml) {
        if (rawHtml == null || rawHtml.isEmpty()) return "";
        String text = Jsoup.parse(rawHtml).text();
        text = text.replaceAll("(?s)On.*wrote:.*$", "");
        text = text.replaceAll("(?i)(best regards|thanks|sincerely|sent from).*$", "");
        return text.trim();
    }
}
