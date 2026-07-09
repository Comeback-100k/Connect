package com.zoho.connect.controller;

import com.zoho.connect.model.*;
import com.zoho.connect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.io.File;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ApiController {

    private static final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    private final String UPLOAD_DIR = "uploads/";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentAuditLogRepository documentAuditLogRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private WorkflowRequestRepository workflowRequestRepository;

    @Autowired
    private RecognitionRepository recognitionRepository;

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private ForgotPasswordRequestRepository forgotPasswordRequestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==========================================
    // AUTHENTICATION & USERS
    // ==========================================

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.ok(user);
            } else if (password.equals(user.getPassword())) {
                // Transparently upgrade legacy plain-text password to BCrypt hash
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
    }
    @PostMapping("/auth/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email"); // Parameter receives ID or Email input
        
        Optional<User> userOpt = Optional.empty();
        try {
            Long id = Long.parseLong(email);
            userOpt = userRepository.findById(id);
        } catch (NumberFormatException e) {
            // Not a number, try by email
        }
        
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(email);
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            ForgotPasswordRequest req = new ForgotPasswordRequest(
                user.getId(),
                user.getEmail(),
                user.getName(),
                LocalDateTime.now(),
                "Pending"
            );
            forgotPasswordRequestRepository.save(req);
            return ResponseEntity.ok(Map.of("message", "Reset requested"));
        }
        return ResponseEntity.badRequest().body("Employee ID or Official Email not found");
    }

    @GetMapping("/auth/check-reset")
    public ResponseEntity<?> checkReset(@RequestParam String email) {
        List<ForgotPasswordRequest> reqs = List.of();
        try {
            Long id = Long.parseLong(email);
            reqs = forgotPasswordRequestRepository.findByEmployeeIdOrderByRequestedAtDesc(id);
        } catch (NumberFormatException e) {
            // Not a number
        }
        if (reqs.isEmpty()) {
            reqs = forgotPasswordRequestRepository.findByEmailOrderByRequestedAtDesc(email);
        }
        
        if (!reqs.isEmpty()) {
            ForgotPasswordRequest latest = reqs.get(0);
            return ResponseEntity.ok(Map.of("status", latest.getStatus(), "approved", latest.getStatus().equals("Completed")));
        }
        return ResponseEntity.ok(Map.of("status", "Not Found", "approved", false));
    }

    @GetMapping("/auth/forgot-password-requests")
    public ResponseEntity<List<ForgotPasswordRequest>> getForgotPasswordRequests() {
        return ResponseEntity.ok(forgotPasswordRequestRepository.findAllByOrderByRequestedAtDesc());
    }

    @PostMapping("/auth/forgot-password-requests/{id}/reset")
    public ResponseEntity<?> resetForgotPasswordRequest(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<ForgotPasswordRequest> reqOpt = forgotPasswordRequestRepository.findById(id);
        if (reqOpt.isPresent()) {
            ForgotPasswordRequest req = reqOpt.get();
            String newPassword = request.get("password");
            
            Optional<User> userOpt = userRepository.findById(req.getEmployeeId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
            }
            
            req.setStatus("Completed");
            forgotPasswordRequestRepository.save(req);
            return ResponseEntity.ok(req);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/auth/forgot-password-requests/{id}/reject")
    public ResponseEntity<?> rejectForgotPasswordRequest(@PathVariable Long id) {
        Optional<ForgotPasswordRequest> reqOpt = forgotPasswordRequestRepository.findById(id);
        if (reqOpt.isPresent()) {
            ForgotPasswordRequest req = reqOpt.get();
            req.setStatus("Rejected");
            forgotPasswordRequestRepository.save(req);
            return ResponseEntity.ok(req);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getResetApproved() != null && user.getResetApproved()) {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetRequested(false);
                user.setResetApproved(false);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
            }
        }
        return ResponseEntity.badRequest().body("Not authorized to reset");
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("User with this email already exists");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getOrDefault("password", "emp123")))
                .name(request.get("name"))
                .department(request.getOrDefault("department", "Engineering"))
                .role(request.getOrDefault("role", "ROLE_EMPLOYEE"))
                .avatarUrl(request.getOrDefault("avatarUrl", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"))
                .status(request.getOrDefault("status", "Active"))
                .bio(request.getOrDefault("bio", ""))
                .build();

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (request.containsKey("name")) user.setName(request.get("name"));
            if (request.containsKey("status")) user.setStatus(request.get("status"));
            if (request.containsKey("bio")) user.setBio(request.get("bio"));
            if (request.containsKey("avatarUrl")) user.setAvatarUrl(request.get("avatarUrl"));
            if (request.containsKey("department")) user.setDepartment(request.get("department"));
            if (request.containsKey("email")) user.setEmail(request.get("email"));
            if (request.containsKey("password") && !request.get("password").trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.get("password")));
            }
            if (request.containsKey("resetRequested")) {
                user.setResetRequested(request.get("resetRequested") == null ? false : Boolean.valueOf(request.get("resetRequested")));
            }
            if (request.containsKey("resetApproved")) {
                user.setResetApproved(request.get("resetApproved") == null ? false : Boolean.valueOf(request.get("resetApproved")));
            }
            if (request.containsKey("resetInfo")) {
                user.setResetInfo(request.get("resetInfo"));
            }
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/users/{id}/approve-reset")
    public ResponseEntity<?> approveReset(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getResetPasswordTemp() != null) {
                user.setPassword(user.getResetPasswordTemp());
            }
            user.setResetApproved(true);
            user.setResetRequested(false);
            user.setResetPasswordTemp(null);
            user.setResetInfo(null);
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // FEED & ANNOUNCEMENTS & KUDOS
    // ==========================================

    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Map<String, Object> request) {
        Long authorId = Long.valueOf(request.get("authorId").toString());
        String content = request.get("content").toString();
        String category = request.get("category").toString();

        Optional<User> authorOpt = userRepository.findById(authorId);
        if (authorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Author not found");
        }

        Post.PostBuilder postBuilder = Post.builder()
                .content(content)
                .author(authorOpt.get())
                .category(category)
                .likesCount(0)
                .likedBy("")
                .createdAt(LocalDateTime.now());

        if (request.containsKey("images") && request.get("images") != null) {
            try {
                String imagesJson = objectMapper.writeValueAsString(request.get("images"));
                postBuilder.imagesJson(imagesJson);
            } catch (Exception e) {
                // Ignore serialization error
            }
        }

        if ("KUDOS".equalsIgnoreCase(category)) {
            if (request.containsKey("kudosReceiverId") && request.get("kudosReceiverId") != null) {
                Long receiverId = Long.valueOf(request.get("kudosReceiverId").toString());
                Optional<User> receiverOpt = userRepository.findById(receiverId);
                receiverOpt.ifPresent(postBuilder::kudosReceiver);
            }
            if (request.containsKey("kudosType")) {
                postBuilder.kudosType(request.get("kudosType").toString());
            }
        }

        Post savedPost = postRepository.save(postBuilder.build());
        return ResponseEntity.ok(savedPost);
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            String likedByStr = post.getLikedBy() == null ? "" : post.getLikedBy();
            List<String> likedList = new ArrayList<>(Arrays.asList(likedByStr.split(",")));
            likedList.removeIf(String::isEmpty);

            String userIdStr = String.valueOf(userId);
            if (likedList.contains(userIdStr)) {
                likedList.remove(userIdStr);
            } else {
                likedList.add(userIdStr);
            }

            post.setLikedBy(String.join(",", likedList));
            post.setLikesCount(likedList.size());
            postRepository.save(post);
            return ResponseEntity.ok(post);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/posts/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentRepository.findByPostIdOrderByCreatedAtAsc(id));
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Long authorId = Long.valueOf(request.get("authorId").toString());
        String content = request.get("content").toString();

        Optional<User> authorOpt = userRepository.findById(authorId);
        if (authorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Author not found");
        }

        Comment comment = Comment.builder()
                .content(content)
                .post(postOpt.get())
                .author(authorOpt.get())
                .createdAt(LocalDateTime.now())
                .build();

        Comment savedComment = commentRepository.save(comment);
        return ResponseEntity.ok(savedComment);
    }

    // ==========================================
    // PUBLIC & PRIVATE GROUPS
    // ==========================================

    @GetMapping("/groups")
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupRepository.findAll());
    }

    @PostMapping("/groups")
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> request) {
        String name = request.get("name").toString();
        String description = request.get("description") == null ? "" : request.get("description").toString();
        boolean isPrivate = (Boolean) request.get("isPrivate");
        Long creatorId = Long.valueOf(request.get("creatorId").toString());

        String membersStr = String.valueOf(creatorId);
        if (request.get("members") != null) {
            String customMembers = request.get("members").toString();
            if (!customMembers.isEmpty()) {
                Set<String> memberSet = new LinkedHashSet<>();
                memberSet.add(String.valueOf(creatorId));
                for (String m : customMembers.split(",")) {
                    String trimmed = m.trim();
                    if (!trimmed.isEmpty()) {
                        memberSet.add(trimmed);
                    }
                }
                membersStr = String.join(",", memberSet);
            }
        }

        Group group = Group.builder()
                .name(name)
                .description(description)
                .isPrivate(isPrivate)
                .members(membersStr)
                .pendingRequests("")
                .build();

        try {
            Group saved = groupRepository.save(group);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Group name must be unique");
        }
    }

    @PutMapping("/groups/{id}")
    public ResponseEntity<?> updateGroup(@PathVariable Long id, @RequestBody Map<String, Object> request, @RequestParam Long userId) {
        java.util.Optional<Group> groupOpt = groupRepository.findById(id);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Group not found");
        }
        
        Group group = groupOpt.get();
        if (group.getIsPrivate()) {
            java.util.List<String> members = java.util.Arrays.asList((group.getMembers() == null ? "" : group.getMembers()).split(","));
            if (!members.contains(String.valueOf(userId))) {
                return ResponseEntity.status(403).body("Access Denied: Only members can edit this private group");
            }
        }
        
        if (request.containsKey("name")) {
            group.setName(request.get("name").toString());
        }
        if (request.containsKey("description")) {
            group.setDescription(request.get("description").toString());
        }
        
        try {
            Group saved = groupRepository.save(group);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating group");
        }
    }

    @PostMapping("/groups/{id}/add-members")
    public ResponseEntity<?> addMembersToGroup(@PathVariable Long id, @RequestParam String userIds) {
        Optional<Group> groupOpt = groupRepository.findById(id);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Group group = groupOpt.get();
        String membersStr = group.getMembers() == null ? "" : group.getMembers();
        Set<String> memberSet = new LinkedHashSet<>(Arrays.asList(membersStr.split(",")));
        memberSet.removeIf(String::isEmpty);

        for (String userId : userIds.split(",")) {
            String trimmed = userId.trim();
            if (!trimmed.isEmpty()) {
                memberSet.add(trimmed);
            }
        }
        group.setMembers(String.join(",", memberSet));
        Group saved = groupRepository.save(group);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/groups/{id}/join")
    public ResponseEntity<?> joinGroup(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Group> groupOpt = groupRepository.findById(id);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Group group = groupOpt.get();
        String membersStr = group.getMembers() == null ? "" : group.getMembers();
        List<String> membersList = new ArrayList<>(Arrays.asList(membersStr.split(",")));
        membersList.removeIf(String::isEmpty);

        String userIdStr = String.valueOf(userId);
        if (membersList.contains(userIdStr)) {
            return ResponseEntity.ok(group); // Already a member
        }

        if (group.getIsPrivate()) {
            // Add to pending requests
            String pendingStr = group.getPendingRequests() == null ? "" : group.getPendingRequests();
            List<String> pendingList = new ArrayList<>(Arrays.asList(pendingStr.split(",")));
            pendingList.removeIf(String::isEmpty);
            if (!pendingList.contains(userIdStr)) {
                pendingList.add(userIdStr);
                group.setPendingRequests(String.join(",", pendingList));
                groupRepository.save(group);
            }
        } else {
            // Join directly
            membersList.add(userIdStr);
            group.setMembers(String.join(",", membersList));
            groupRepository.save(group);
        }

        return ResponseEntity.ok(group);
    }

    @PostMapping("/groups/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id, @RequestParam Long requesterId, @RequestParam Long adminId) {
        Optional<Group> groupOpt = groupRepository.findById(id);
        if (groupOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Group group = groupOpt.get();
        // Check if adminId is in the member list (only members/creators can approve join requests)
        String membersStr = group.getMembers() == null ? "" : group.getMembers();
        List<String> membersList = new ArrayList<>(Arrays.asList(membersStr.split(",")));
        membersList.removeIf(String::isEmpty);

        if (!membersList.contains(String.valueOf(adminId))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only current group members can approve join requests.");
        }

        String pendingStr = group.getPendingRequests() == null ? "" : group.getPendingRequests();
        List<String> pendingList = new ArrayList<>(Arrays.asList(pendingStr.split(",")));
        pendingList.removeIf(String::isEmpty);

        String requesterIdStr = String.valueOf(requesterId);
        if (pendingList.contains(requesterIdStr)) {
            pendingList.remove(requesterIdStr);
            membersList.add(requesterIdStr);

            group.setPendingRequests(String.join(",", pendingList));
            group.setMembers(String.join(",", membersList));
            groupRepository.save(group);
            return ResponseEntity.ok(group);
        }

        return ResponseEntity.badRequest().body("Requester not found in pending list");
    }

    // ==========================================
    // TASKS & BOARDS (KANBAN)
    // ==========================================

    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskRepository.findAll());
    }

    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(@RequestBody Map<String, Object> request) {
        String title = request.get("title").toString();
        String description = request.get("description") == null ? "" : request.get("description").toString();
        String priority = request.get("priority") == null ? "Medium" : request.get("priority").toString();
        String status = request.get("status") == null ? "TODO" : request.get("status").toString();
        Long creatorId = Long.valueOf(request.get("creatorId").toString());

        Optional<User> creatorOpt = userRepository.findById(creatorId);
        if (creatorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Creator not found");
        }

        boolean isPrivate = request.containsKey("isPrivate") && Boolean.parseBoolean(request.get("isPrivate").toString());
        boolean isChecklist = request.containsKey("isChecklist") && Boolean.parseBoolean(request.get("isChecklist").toString());

        Task.TaskBuilder taskBuilder = Task.builder()
                .title(title)
                .description(description)
                .priority(priority)
                .status(status)
                .isPrivate(isPrivate)
                .isChecklist(isChecklist)
                .creator(creatorOpt.get());

        if (request.containsKey("assigneeId") && request.get("assigneeId") != null && !request.get("assigneeId").toString().isEmpty()) {
            Long assigneeId = Long.valueOf(request.get("assigneeId").toString());
            Optional<User> assigneeOpt = userRepository.findById(assigneeId);
            assigneeOpt.ifPresent(taskBuilder::assignee);
        }

        if (request.containsKey("dueDate") && request.get("dueDate") != null && !request.get("dueDate").toString().isEmpty()) {
            taskBuilder.dueDate(LocalDate.parse(request.get("dueDate").toString()));
        }

        Task saved = taskRepository.save(taskBuilder.build());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setStatus(status);
            taskRepository.save(task);
            return ResponseEntity.ok(task);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return ResponseEntity.ok("Deleted");
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // DOCUMENTS & FILE MANAGEMENT & KNOWLEDGE BASE
    // ==========================================

    @GetMapping("/documents")
    public ResponseEntity<List<Document>> getAllDocuments(@RequestParam(required = false) Long userId) {
        List<Document> allDocs = documentRepository.findAll();
        if (userId != null) {
            allDocs = allDocs.stream()
                .filter(d -> d.getRecipientId() == null || d.getRecipientId().equals(userId) || d.getUploader().getId().equals(userId))
                .collect(java.util.stream.Collectors.toList());
        }
        return ResponseEntity.ok(allDocs);
    }

    @PostMapping("/documents")
    public ResponseEntity<?> createDocument(@RequestBody Map<String, Object> request) {
        String title = request.get("title").toString();
        String content = request.get("content") == null ? "" : request.get("content").toString();
        String type = request.get("type").toString(); // "MANUAL", "FILE", "FOLDER"
        Long uploaderId = Long.valueOf(request.get("uploaderId").toString());

        Optional<User> uploaderOpt = userRepository.findById(uploaderId);
        if (uploaderOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploader not found");
        }

        Document.DocumentBuilder docBuilder = Document.builder()
                .title(title)
                .content(content)
                .type(type)
                .uploader(uploaderOpt.get())
                .createdAt(LocalDateTime.now());

        if (request.containsKey("recipientId") && request.get("recipientId") != null && !request.get("recipientId").toString().isEmpty()) {
            docBuilder.recipientId(Long.valueOf(request.get("recipientId").toString()));
        }

        if (request.containsKey("parentId") && request.get("parentId") != null && !request.get("parentId").toString().isEmpty()) {
            docBuilder.parentId(Long.valueOf(request.get("parentId").toString()));
        }

        if ("FILE".equalsIgnoreCase(type)) {
            if (request.containsKey("fileName")) docBuilder.fileName(request.get("fileName").toString());
            if (request.containsKey("fileType")) docBuilder.fileType(request.get("fileType").toString());
            if (request.containsKey("fileSize")) docBuilder.fileSize(Long.valueOf(request.get("fileSize").toString()));
        }

        Document saved = documentRepository.save(docBuilder.build());
        
        // Log action
        String action = "FOLDER".equalsIgnoreCase(type) ? "CREATE_FOLDER" : "UPLOAD";
        documentAuditLogRepository.save(new DocumentAuditLog(saved.getId(), saved.getTitle() != null ? saved.getTitle() : saved.getFileName(), action, uploaderOpt.get().getId(), uploaderOpt.get().getName(), LocalDateTime.now(), "Created " + type.toLowerCase()));

        return ResponseEntity.ok(saved);
    }

    @PostMapping(value = "/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam("type") String type,
            @RequestParam("uploaderId") Long uploaderId,
            @RequestParam(value = "recipientId", required = false) Long recipientId,
            @RequestParam(value = "parentId", required = false) Long parentId) {
        
        Optional<User> uploaderOpt = userRepository.findById(uploaderId);
        if (uploaderOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploader not found");
        }

        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            String originalFilename = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID().toString() + "_" + originalFilename;
            Path filePath = Paths.get(UPLOAD_DIR + storedFileName);
            Files.write(filePath, file.getBytes());

            String fileType = "unknown";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileType = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
            }

            Document.DocumentBuilder docBuilder = Document.builder()
                    .title(title)
                    .content(content == null ? "" : content)
                    .type(type)
                    .fileName(originalFilename)
                    .fileType(fileType)
                    .fileSize(file.getSize())
                    .storedFileName(storedFileName)
                    .uploader(uploaderOpt.get())
                    .createdAt(LocalDateTime.now());
            
            if (recipientId != null) {
                docBuilder.recipientId(recipientId);
            }
            if (parentId != null) {
                docBuilder.parentId(parentId);
            }

            Document saved = documentRepository.save(docBuilder.build());
            documentAuditLogRepository.save(new DocumentAuditLog(saved.getId(), saved.getFileName(), "UPLOAD", uploaderOpt.get().getId(), uploaderOpt.get().getName(), LocalDateTime.now(), "Uploaded file"));

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        }
    }

    @GetMapping("/documents/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        try {
            Optional<Document> docOpt = documentRepository.findById(id);
            if (docOpt.isEmpty() || docOpt.get().getStoredFileName() == null) {
                return ResponseEntity.notFound().build();
            }

            Document doc = docOpt.get();
            Path filePath = Paths.get(UPLOAD_DIR + doc.getStoredFileName());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String mimeType = Files.probeContentType(filePath);
                if (mimeType == null) {
                    mimeType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(mimeType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/documents/{id}")
    public ResponseEntity<?> updateDocument(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Document> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) return ResponseEntity.notFound().build();

        Document doc = docOpt.get();
        Long requestUserId = Long.valueOf(request.get("userId").toString());
        Optional<User> userOpt = userRepository.findById(requestUserId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found");
        User user = userOpt.get();

        if (!doc.getUploader().getId().equals(user.getId()) && !"ROLE_ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        boolean moved = false;
        if (request.containsKey("parentId")) {
            Object pidObj = request.get("parentId");
            Long newParentId = (pidObj == null || pidObj.toString().isEmpty()) ? null : Long.valueOf(pidObj.toString());
            doc.setParentId(newParentId);
            moved = true;
        }

        if (request.containsKey("title")) {
            doc.setTitle(request.get("title").toString());
        }

        Document updated = documentRepository.save(doc);
        
        String action = moved ? "MOVE" : "RENAME";
        documentAuditLogRepository.save(new DocumentAuditLog(updated.getId(), updated.getTitle() != null ? updated.getTitle() : updated.getFileName(), action, user.getId(), user.getName(), LocalDateTime.now(), "Updated document details"));
        
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Document> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) return ResponseEntity.notFound().build();

        Document doc = docOpt.get();
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found");
        User user = userOpt.get();

        if (!doc.getUploader().getId().equals(user.getId()) && !"ROLE_ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }

        documentRepository.deleteById(id);
        
        documentAuditLogRepository.save(new DocumentAuditLog(id, doc.getTitle() != null ? doc.getTitle() : doc.getFileName(), "DELETE", user.getId(), user.getName(), LocalDateTime.now(), "Deleted document"));
        
        return ResponseEntity.ok("Deleted");
    }

    @GetMapping("/documents/logs")
    public ResponseEntity<List<DocumentAuditLog>> getDocumentLogs() {
        return ResponseEntity.ok(documentAuditLogRepository.findAllByOrderByTimestampDesc());
    }

    // ==========================================
    // EVENTS
    // ==========================================

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAllByOrderByEventDateAsc());
    }

    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestBody Map<String, Object> request) {
        String title = request.get("title").toString();
        String description = request.get("description") == null ? "" : request.get("description").toString();
        String location = request.get("location") == null ? "" : request.get("location").toString();
        LocalDateTime eventDate = LocalDateTime.parse(request.get("eventDate").toString());
        Long creatorId = Long.valueOf(request.get("creatorId").toString());

        Optional<User> creatorOpt = userRepository.findById(creatorId);
        if (creatorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Creator not found");
        }

        Event event = Event.builder()
                .title(title)
                .description(description)
                .location(location)
                .eventDate(eventDate)
                .creator(creatorOpt.get())
                .rsvps("")
                .build();

        Event saved = eventRepository.save(event);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/events/{id}/rsvp")
    public ResponseEntity<?> toggleRsvp(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            String rsvpStr = event.getRsvps() == null ? "" : event.getRsvps();
            List<String> rsvpList = new ArrayList<>(Arrays.asList(rsvpStr.split(",")));
            rsvpList.removeIf(String::isEmpty);

            String userIdStr = String.valueOf(userId);
            if (rsvpList.contains(userIdStr)) {
                rsvpList.remove(userIdStr);
            } else {
                rsvpList.add(userIdStr);
            }

            event.setRsvps(String.join(",", rsvpList));
            eventRepository.save(event);
            return ResponseEntity.ok(event);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            if (request.containsKey("title")) {
                event.setTitle(request.get("title").toString());
            }
            if (request.containsKey("description")) {
                event.setDescription(request.get("description") == null ? "" : request.get("description").toString());
            }
            if (request.containsKey("location")) {
                event.setLocation(request.get("location") == null ? "" : request.get("location").toString());
            }
            if (request.containsKey("eventDate")) {
                event.setEventDate(LocalDateTime.parse(request.get("eventDate").toString()));
            }
            Event saved = eventRepository.save(event);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isPresent()) {
            eventRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // POLLS & SURVEYS
    // ==========================================

    @GetMapping("/polls")
    public ResponseEntity<List<Poll>> getAllPolls(@RequestParam(required = false) Long userId) {
        List<Poll> allPolls = pollRepository.findAllByOrderByCreatedAtDesc();
        if (userId == null) {
            return ResponseEntity.ok(allPolls);
        }

        User user = userRepository.findById(userId).orElse(null);
        String userIdStr = String.valueOf(userId);
        
        List<String> userGroups = new ArrayList<>();
        if (user != null) {
            if (user.getDepartment() != null) userGroups.add(user.getDepartment());
            groupRepository.findAll().forEach(g -> {
                if (g.getMembers() != null && Arrays.asList(g.getMembers().split(",")).contains(userIdStr)) {
                    userGroups.add(g.getName());
                }
            });
        }

        List<Poll> filtered = new ArrayList<>();
        for (Poll p : allPolls) {
            if (p.getVisibility() == null || !p.getVisibility().equals("Private")) {
                filtered.add(p);
            } else {
                boolean isCreator = p.getCreator() != null && p.getCreator().getId().equals(userId);
                boolean inEmployees = p.getSelectedEmployeeIds() != null && Arrays.asList(p.getSelectedEmployeeIds().split(",")).contains(userIdStr);
                boolean inTeams = p.getSelectedTeamIds() != null && Arrays.stream(p.getSelectedTeamIds().split(",")).anyMatch(userGroups::contains);
                
                if (isCreator || inEmployees || inTeams) {
                    filtered.add(p);
                }
            }
        }
        return ResponseEntity.ok(filtered);
    }

    @PostMapping("/polls")
    public ResponseEntity<?> createPoll(@RequestBody Map<String, Object> request) {
        String question = request.get("question").toString();
        String options = request.get("options").toString(); // Comma-separated
        Long creatorId = Long.valueOf(request.get("creatorId").toString());
        
        String visibility = request.containsKey("visibility") ? request.get("visibility").toString() : "Public";
        String selectedEmployeeIds = request.containsKey("selectedEmployeeIds") ? request.get("selectedEmployeeIds").toString() : "";
        String selectedTeamIds = request.containsKey("selectedTeamIds") ? request.get("selectedTeamIds").toString() : "";

        if ("Private".equals(visibility) && selectedEmployeeIds.isEmpty() && selectedTeamIds.isEmpty()) {
            return ResponseEntity.badRequest().body("Private polls must have at least one participant selected.");
        }

        Optional<User> creatorOpt = userRepository.findById(creatorId);
        if (creatorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Creator not found");
        }

        Poll poll = Poll.builder()
                .question(question)
                .options(options)
                .votes("")
                .creator(creatorOpt.get())
                .createdAt(LocalDateTime.now())
                .visibility(visibility)
                .selectedEmployeeIds(selectedEmployeeIds)
                .selectedTeamIds(selectedTeamIds)
                .build();

        Poll saved = pollRepository.save(poll);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/polls/{id}/vote")
    public ResponseEntity<?> submitVote(@PathVariable Long id, @RequestParam Long userId, @RequestParam int optionIndex) {
        Optional<Poll> pollOpt = pollRepository.findById(id);
        if (pollOpt.isPresent()) {
            Poll poll = pollOpt.get();
            
            // Security Check
            if ("Private".equals(poll.getVisibility())) {
                User user = userRepository.findById(userId).orElse(null);
                String userIdStr = String.valueOf(userId);
                List<String> userGroups = new ArrayList<>();
                if (user != null) {
                    if (user.getDepartment() != null) userGroups.add(user.getDepartment());
                    groupRepository.findAll().forEach(g -> {
                        if (g.getMembers() != null && Arrays.asList(g.getMembers().split(",")).contains(userIdStr)) {
                            userGroups.add(g.getName());
                        }
                    });
                }
                
                boolean isCreator = poll.getCreator() != null && poll.getCreator().getId().equals(userId);
                boolean inEmployees = poll.getSelectedEmployeeIds() != null && Arrays.asList(poll.getSelectedEmployeeIds().split(",")).contains(userIdStr);
                boolean inTeams = poll.getSelectedTeamIds() != null && Arrays.stream(poll.getSelectedTeamIds().split(",")).anyMatch(userGroups::contains);
                
                if (!isCreator && !inEmployees && !inTeams) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied. This poll is private.");
                }
            }

            String votesStr = poll.getVotes() == null ? "" : poll.getVotes();
            List<String> votesList = new ArrayList<>(Arrays.asList(votesStr.split(",")));
            votesList.removeIf(String::isEmpty);

            // Check if user already voted. If so, remove their old vote
            votesList.removeIf(vote -> vote.startsWith(userId + ":"));

            // Add new vote
            votesList.add(userId + ":" + optionIndex);

            poll.setVotes(String.join(",", votesList));
            pollRepository.save(poll);
            return ResponseEntity.ok(poll);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/polls/{id}")
    public ResponseEntity<?> deletePoll(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Poll> pollOpt = pollRepository.findById(id);
        if (pollOpt.isPresent()) {
            Poll poll = pollOpt.get();
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (poll.getCreator().getId().equals(userId) || "ROLE_ADMIN".equals(user.getRole())) {
                    pollRepository.delete(poll);
                    return ResponseEntity.ok(Map.of("message", "Poll deleted successfully"));
                }
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied. Only the creator or admin can delete this poll.");
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/polls/{id}")
    public ResponseEntity<?> updatePoll(@PathVariable Long id, @RequestBody Map<String, Object> request, @RequestParam Long userId) {
        Optional<Poll> pollOpt = pollRepository.findById(id);
        if (pollOpt.isPresent()) {
            Poll poll = pollOpt.get();
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (poll.getCreator().getId().equals(userId) || "ROLE_ADMIN".equals(user.getRole())) {
                    if (request.containsKey("question")) {
                        poll.setQuestion(request.get("question") != null ? request.get("question").toString() : "");
                    }
                    if (request.containsKey("options")) {
                        poll.setOptions(request.get("options") != null ? request.get("options").toString() : "");
                    }
                    if (request.containsKey("visibility")) {
                        poll.setVisibility(request.get("visibility") != null ? request.get("visibility").toString() : "Public");
                    }
                    if (request.containsKey("selectedEmployeeIds")) {
                        poll.setSelectedEmployeeIds(request.get("selectedEmployeeIds") != null ? request.get("selectedEmployeeIds").toString() : null);
                    }
                    if (request.containsKey("selectedTeamIds")) {
                        poll.setSelectedTeamIds(request.get("selectedTeamIds") != null ? request.get("selectedTeamIds").toString() : null);
                    }
                    
                    Poll updated = pollRepository.save(poll);
                    return ResponseEntity.ok(updated);
                }
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied. Only the creator or admin can edit this poll.");
            }
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // WORKFLOW AUTOMATION (REQUESTS & APPROVALS)
    // ==========================================

    @GetMapping("/workflows")
    public ResponseEntity<List<WorkflowRequest>> getAllWorkflows() {
        return ResponseEntity.ok(workflowRequestRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/workflows/my")
    public ResponseEntity<List<WorkflowRequest>> getMyWorkflows(@RequestParam Long userId) {
        return ResponseEntity.ok(workflowRequestRepository.findByCreatorIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/workflows")
    public ResponseEntity<?> createWorkflow(@RequestBody Map<String, Object> request) {
        String type = request.get("type").toString(); // "LEAVE", "EXPENSE", "IT_SUPPORT"
        String title = request.get("title").toString();
        String description = request.get("description") == null ? "" : request.get("description").toString();
        Long creatorId = Long.valueOf(request.get("creatorId").toString());

        Optional<User> creatorOpt = userRepository.findById(creatorId);
        if (creatorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Creator not found");
        }

        WorkflowRequest wr = WorkflowRequest.builder()
                .type(type)
                .title(title)
                .description(description)
                .status("PENDING")
                .creator(creatorOpt.get())
                .createdAt(LocalDateTime.now())
                .build();

        WorkflowRequest saved = workflowRequestRepository.save(wr);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/workflows/{id}/review")
    public ResponseEntity<?> reviewWorkflow(@PathVariable Long id, @RequestParam String status, @RequestParam Long reviewerId, @RequestParam(required = false) String comments) {
        Optional<WorkflowRequest> wrOpt = workflowRequestRepository.findById(id);
        if (wrOpt.isPresent()) {
            WorkflowRequest wr = wrOpt.get();
            Optional<User> reviewerOpt = userRepository.findById(reviewerId);
            if (reviewerOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Reviewer not found");
            }

            wr.setStatus(status); // "APPROVED" or "REJECTED"
            wr.setReviewer(reviewerOpt.get());
            if (comments != null) {
                wr.setAdminComments(comments);
            }
            workflowRequestRepository.save(wr);
            return ResponseEntity.ok(wr);
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // RECOGNITION (KUDOS) & NOTIFICATIONS
    // ==========================================

    @GetMapping("/recognitions")
    public ResponseEntity<List<Recognition>> getRecognitions() {
        return ResponseEntity.ok(recognitionRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/recognitions")
    public ResponseEntity<?> createRecognition(@RequestBody Map<String, Object> request) {
        Long senderId = Long.valueOf(request.get("senderId").toString());
        Long receiverId = Long.valueOf(request.get("receiverId").toString());
        String category = request.get("category").toString();
        String message = request.get("message").toString();
        String mentionsJson = request.get("mentionsJson") == null ? "[]" : request.get("mentionsJson").toString();
        String visibility = request.get("visibility").toString();
        String rewardBadge = request.get("rewardBadge") == null ? "" : request.get("rewardBadge").toString();

        Optional<User> senderOpt = userRepository.findById(senderId);
        Optional<User> receiverOpt = userRepository.findById(receiverId);

        if (senderOpt.isEmpty() || receiverOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Sender or receiver not found");
        }

        Recognition recognition = new Recognition(
                senderOpt.get(),
                receiverOpt.get(),
                category,
                message,
                mentionsJson,
                visibility,
                rewardBadge,
                "{}", // Initial empty reactions
                LocalDateTime.now()
        );

        Recognition saved = recognitionRepository.save(recognition);

        // Auto-generate notifications
        // 1. For receiver
        notificationRepository.save(new Notification(
                receiverOpt.get(),
                "You received a new Kudos recognition from " + senderOpt.get().getName() + "!",
                false,
                LocalDateTime.now()
        ));

        // 2. For mentioned users
        try {
            List<Integer> mentionIds = objectMapper.readValue(mentionsJson, new com.fasterxml.jackson.core.type.TypeReference<List<Integer>>(){});
            for (Integer mId : mentionIds) {
                if (mId.longValue() == receiverId) continue;
                
                Optional<User> mentionedUser = userRepository.findById(mId.longValue());
                if (mentionedUser.isPresent()) {
                    notificationRepository.save(new Notification(
                            mentionedUser.get(),
                            "You were mentioned in a Kudos recognition by " + senderOpt.get().getName() + ".",
                            false,
                            LocalDateTime.now()
                    ));
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to parse mentions JSON for notifications: " + e.getMessage());
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/recognitions/{id}")
    public ResponseEntity<?> updateRecognition(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Recognition> recOpt = recognitionRepository.findById(id);
        if (recOpt.isEmpty()) return ResponseEntity.notFound().build();

        Recognition rec = recOpt.get();
        Long userId = Long.valueOf(request.get("userId").toString());
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty() || (!rec.getSender().getId().equals(userId) && !"ROLE_ADMIN".equals(userOpt.get().getRole()))) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        if (request.containsKey("category")) rec.setCategory(request.get("category").toString());
        if (request.containsKey("message")) rec.setMessage(request.get("message").toString());
        if (request.containsKey("visibility")) rec.setVisibility(request.get("visibility").toString());
        if (request.containsKey("rewardBadge")) rec.setRewardBadge(request.get("rewardBadge").toString());
        if (request.containsKey("mentionsJson")) rec.setMentionsJson(request.get("mentionsJson").toString());

        return ResponseEntity.ok(recognitionRepository.save(rec));
    }

    @DeleteMapping("/recognitions/{id}")
    public ResponseEntity<?> deleteRecognition(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Recognition> recOpt = recognitionRepository.findById(id);
        if (recOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty() || (!recOpt.get().getSender().getId().equals(userId) && !"ROLE_ADMIN".equals(userOpt.get().getRole()))) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        recognitionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/recognitions/{id}/react")
    public ResponseEntity<?> reactRecognition(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Recognition> recOpt = recognitionRepository.findById(id);
        if (recOpt.isEmpty()) return ResponseEntity.notFound().build();

        Recognition rec = recOpt.get();
        String type = request.get("type").toString(); // e.g., "CELEBRATE", "APPRECIATE", "CLAP"
        Long userId = Long.valueOf(request.get("userId").toString());

        try {
            Map<String, List<Integer>> reactions = objectMapper.readValue(
                    rec.getReactionsJson(), 
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, List<Integer>>>(){}
            );

            List<Integer> usersReacted = reactions.getOrDefault(type, new ArrayList<>());
            if (usersReacted.contains(userId.intValue())) {
                usersReacted.remove(Integer.valueOf(userId.intValue()));
            } else {
                usersReacted.add(userId.intValue());
            }
            reactions.put(type, usersReacted);

            rec.setReactionsJson(objectMapper.writeValueAsString(reactions));
            recognitionRepository.save(rec);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing reaction");
        }
        
        return ResponseEntity.ok(rec);
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable Long id, @RequestParam Long userId) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent()) {
            Notification notif = notifOpt.get();
            if (notif.getRecipient().getId().equals(userId)) {
                notif.setRead(true);
                notificationRepository.save(notif);
                return ResponseEntity.ok(notif);
            }
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // ANALYTICS & DASHBOARD STATS
    // ==========================================

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();

        long userCount = userRepository.count();
        long postCount = postRepository.count();
        
        List<Post> posts = postRepository.findAll();
        long kudosCount = posts.stream().filter(p -> "KUDOS".equalsIgnoreCase(p.getCategory())).count();
        long announcementCount = posts.stream().filter(p -> "ANNOUNCEMENT".equalsIgnoreCase(p.getCategory())).count();

        List<Task> tasks = taskRepository.findAll();
        long taskDone = tasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();
        long taskPending = tasks.size() - taskDone;

        List<WorkflowRequest> workflows = workflowRequestRepository.findAll();
        long totalApprovals = workflows.stream().filter(w -> !"PENDING".equalsIgnoreCase(w.getStatus())).count();
        long approvedCount = workflows.stream().filter(w -> "APPROVED".equalsIgnoreCase(w.getStatus())).count();
        long pendingApprovals = workflows.size() - totalApprovals;
        
        double approvalRate = totalApprovals == 0 ? 0.0 : (double) approvedCount / totalApprovals * 100.0;

        stats.put("userCount", userCount);
        stats.put("postCount", postCount);
        stats.put("kudosCount", kudosCount);
        stats.put("announcementCount", announcementCount);
        stats.put("taskDoneCount", taskDone);
        stats.put("taskPendingCount", taskPending);
        stats.put("pendingApprovalsCount", pendingApprovals);
        stats.put("approvalRatePercentage", Math.round(approvalRate * 10.0) / 10.0);

        return ResponseEntity.ok(stats);
    }

    // ==========================================
    // CHAT & MESSAGING
    // ==========================================

    @PostMapping("/chat")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request) {
        Long senderId = Long.valueOf(request.get("senderId").toString());
        String content = request.get("content").toString();
        
        Optional<User> senderOpt = userRepository.findById(senderId);
        if (senderOpt.isEmpty()) return ResponseEntity.badRequest().body("Sender not found");

        Message.MessageBuilder builder = Message.builder()
                .sender(senderOpt.get())
                .content(content)
                .createdAt(LocalDateTime.now())
                .deliveryStatus("DELIVERED")
                .readStatus(false);
        
        if (request.containsKey("attachments") && request.get("attachments") != null) {
            try {
                builder.attachmentsJson(objectMapper.writeValueAsString(request.get("attachments")));
            } catch (Exception e) {}
        }

        if (request.containsKey("groupId") && request.get("groupId") != null) {
            Long groupId = Long.valueOf(request.get("groupId").toString());
            Optional<Group> groupOpt = groupRepository.findById(groupId);
            if (groupOpt.isEmpty()) return ResponseEntity.badRequest().body("Group not found");
            Group group = groupOpt.get();
            
            // Validate group membership
            String memberIds = group.getMembers() == null ? "" : group.getMembers();
            if (!Arrays.asList(memberIds.split(",")).contains(String.valueOf(senderId))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not a member of this group");
            }
            builder.groupId(groupId);
        } else if (request.containsKey("recipientId") && request.get("recipientId") != null) {
            builder.recipientId(Long.valueOf(request.get("recipientId").toString()));
        } else {
            return ResponseEntity.badRequest().body("Must specify groupId or recipientId");
        }

        return ResponseEntity.ok(messageRepository.save(builder.build()));
    }

    @GetMapping("/chat/group/{groupId}")
    public ResponseEntity<?> getGroupMessages(@PathVariable Long groupId, @RequestParam Long userId) {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) return ResponseEntity.badRequest().body("Group not found");
        
        String memberIds = groupOpt.get().getMembers() == null ? "" : groupOpt.get().getMembers();
        if (!Arrays.asList(memberIds.split(",")).contains(String.valueOf(userId))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not a member of this group");
        }
        
        return ResponseEntity.ok(messageRepository.findByGroupIdOrderByCreatedAtAsc(groupId));
    }

    @GetMapping("/chat/direct")
    public ResponseEntity<?> getDirectMessages(@RequestParam Long u1, @RequestParam Long u2) {
        return ResponseEntity.ok(messageRepository.findDirectMessages(u1, u2));
    }

    @GetMapping("/chat/all")
    public ResponseEntity<?> getAllMessagesForUser(@RequestParam Long userId) {
        List<Group> allGroups = groupRepository.findAll();
        List<Long> userGroupIds = allGroups.stream()
            .filter(g -> g.getMembers() != null && Arrays.asList(g.getMembers().split(",")).contains(String.valueOf(userId)))
            .map(Group::getId)
            .collect(Collectors.toList());
            
        if (userGroupIds.isEmpty()) {
            userGroupIds.add(-1L); // Prevent empty IN clause syntax error
        }
        
        return ResponseEntity.ok(messageRepository.findAllMessagesForUser(userId, userGroupIds));
    }

    @PutMapping("/chat/read")
    public ResponseEntity<?> markMessagesAsRead(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String type = request.get("type").toString();
        Long targetId = Long.valueOf(request.get("id").toString());
        
        List<Message> toUpdate;
        if ("group".equals(type)) {
            toUpdate = messageRepository.findByGroupIdOrderByCreatedAtAsc(targetId);
        } else {
            toUpdate = messageRepository.findDirectMessages(userId, targetId);
        }
        
        boolean changed = false;
        for (Message m : toUpdate) {
            if (!m.getReadStatus() && m.getSender().getId().longValue() != userId.longValue()) {
                m.setReadStatus(true);
                changed = true;
            }
        }
        
        if (changed) {
            messageRepository.saveAll(toUpdate);
        }
        
        return ResponseEntity.ok().build();
    }
}
