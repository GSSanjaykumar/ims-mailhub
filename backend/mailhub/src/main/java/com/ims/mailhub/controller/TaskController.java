package com.ims.mailhub.controller;

import com.ims.mailhub.model.Email;
import com.ims.mailhub.model.Task;
import com.ims.mailhub.repository.EmailRepository;
import com.ims.mailhub.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmailRepository emailRepository;

    @GetMapping
    public List<Map<String, Object>> getTasks(@RequestParam(required = false) String priority,
                                               @RequestParam(required = false) String status) {
        List<Task> tasks = taskRepository.findAll();
        if (priority != null) {
            tasks = tasks.stream().filter(t -> priority.equals(t.getPriority()))
                .collect(Collectors.toList());
        }
        if (status != null) {
            tasks = tasks.stream().filter(t -> status.equals(t.getStatus()))
                .collect(Collectors.toList());
        }

        // Join email info for each task
        List<Map<String, Object>> result = new ArrayList<>();
        for (Task t : tasks) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", t.getId());
            map.put("emailId", t.getEmailId());
            map.put("userId", t.getUserId());
            map.put("title", t.getTitle());
            map.put("description", t.getDescription());
            map.put("priority", t.getPriority());
            map.put("dueDate", t.getDueDate());
            map.put("dueRaw", t.getDueRaw());
            map.put("confidenceScore", t.getConfidenceScore());
            map.put("confTaskIntent", t.getConfTaskIntent());
            map.put("confDeadline", t.getConfDeadline());
            map.put("confPriorityReason", t.getConfPriorityReason());
            map.put("confTagAccuracy", t.getConfTagAccuracy());
            map.put("confSenderAuthority", t.getConfSenderAuthority());
            map.put("hasCollision", t.getHasCollision());
            map.put("collisionDetail", t.getCollisionDetail());
            map.put("status", t.getStatus());
            map.put("syncedTo", t.getSyncedTo());
            map.put("deepLinkModule", t.getDeepLinkModule());
            map.put("createdAt", t.getCreatedAt());

            // Join email details
            if (t.getEmailId() != null) {
                emailRepository.findById(t.getEmailId()).ifPresent(email -> {
                    Map<String, Object> emailInfo = new LinkedHashMap<>();
                    emailInfo.put("id", email.getId());
                    emailInfo.put("subject", email.getSubject());
                    emailInfo.put("senderName", email.getSenderName());
                    emailInfo.put("senderEmail", email.getSenderEmail());
                    emailInfo.put("bodyClean", email.getBodyClean());
                    emailInfo.put("bodyRaw", email.getBodyRaw());
                    emailInfo.put("aiSummary", email.getAiSummary());
                    emailInfo.put("category", email.getCategory());
                    emailInfo.put("isUrgent", email.getIsUrgent());
                    emailInfo.put("receivedAt", email.getReceivedAt());
                    map.put("email", emailInfo);
                });
            }
            result.add(map);
        }
        return result;
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TaskController.class);

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
        @PathVariable Long id,
        @RequestBody Map<String, Object> updates) {

        return taskRepository.findById(id).map(task -> {
            if (updates.containsKey("title") && updates.get("title") != null) {
                task.setTitle(updates.get("title").toString());
            }
            if (updates.containsKey("priority") && updates.get("priority") != null) {
                task.setPriority(updates.get("priority").toString().toUpperCase());
            }
            if (updates.containsKey("dueRaw") && updates.get("dueRaw") != null) {
                task.setDueRaw(updates.get("dueRaw").toString());
            }
            if (updates.containsKey("status") && updates.get("status") != null) {
                task.setStatus(updates.get("status").toString());
            }
            Task saved = taskRepository.save(task);
            log.info("Task {} updated: title={} priority={} dueRaw={} status={}",
                id, saved.getTitle(), saved.getPriority(),
                saved.getDueRaw(), saved.getStatus());
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/approve")
    public Task approveTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setStatus("ACTIVE");
        return taskRepository.save(task);
    }

    @PostMapping("/{id}/push")
    public ResponseEntity<Map<String, Object>> pushTask(@PathVariable Long id,
                                                         @RequestBody Map<String, String> req) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setStatus("SYNCED");
        task.setSyncedTo(req.get("platform"));
        taskRepository.save(task);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Task pushed to " + req.get("platform")
        ));
    }
}
