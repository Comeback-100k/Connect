package com.zoho.connect.service;

import com.zoho.connect.model.*;
import com.zoho.connect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private WorkflowRequestRepository workflowRequestRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_status BOOLEAN DEFAULT FALSE");
            jdbcTemplate.execute("ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(255) DEFAULT 'DELIVERED'");
        } catch (Exception e) {
            System.out.println("Could not alter messages table: " + e.getMessage());
        }

        if (userRepository.count() > 0) {
            seedNewGroupUsers();
            seedEventsIfAbsent();
            return; // DB already seeded
        }

        // 1. Seed Users
        User admin = User.builder()
                .email("admin@company.com")
                .password(passwordEncoder.encode("admin123"))
                .name("Sarah Jenkins")
                .role("ROLE_ADMIN")
                .department("Human Resources")
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                .status("Active")
                .bio("HR Director & System Admin. Let me know if you need leave approvals or workflow help.")
                .build();

        User emp1 = User.builder()
                .email("employee@company.com")
                .password(passwordEncoder.encode("emp123"))
                .name("David Miller")
                .role("ROLE_EMPLOYEE")
                .department("Engineering")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
                .status("Active")
                .bio("Senior Software Engineer. Building core systems and scaling services.")
                .build();

        User emp2 = User.builder()
                .email("john.doe@company.com")
                .password(passwordEncoder.encode("emp123"))
                .name("John Doe")
                .role("ROLE_EMPLOYEE")
                .department("Product Design")
                .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150")
                .status("Active")
                .bio("UI/UX Designer. Focused on crafting beautiful, minimal white & grey layouts.")
                .build();

        User emp3 = User.builder()
                .email("jane.smith@company.com")
                .password(passwordEncoder.encode("emp123"))
                .name("Jane Smith")
                .role("ROLE_EMPLOYEE")
                .department("Marketing")
                .avatarUrl("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150")
                .status("On Leave")
                .bio("Marketing Specialist. Traveling for conference - out of office until Monday.")
                .build();

        userRepository.saveAll(Arrays.asList(admin, emp1, emp2, emp3));

        // Retrieve saved users (with IDs generated)
        admin = userRepository.findByEmail("admin@company.com").get();
        emp1 = userRepository.findByEmail("employee@company.com").get();
        emp2 = userRepository.findByEmail("john.doe@company.com").get();
        emp3 = userRepository.findByEmail("jane.smith@company.com").get();

        // 2. Seed Posts
        Post p1 = Post.builder()
                .content("Welcome everyone to the new Zoho Connect Collaboration Portal! This is our central space for sharing news, joining groups, managing board tasks, writing documentation, and automating leave/expense approvals.")
                .author(admin)
                .category("ANNOUNCEMENT")
                .createdAt(LocalDateTime.now().minusDays(3))
                .likesCount(2)
                .likedBy(emp1.getId() + "," + emp2.getId())
                .imagesJson("[{\"url\":\"https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=800\",\"description\":\"Our brand new corporate digital workspace launch!\"}]")
                .build();

        Post p2 = Post.builder()
                .content("Just updated the new product UI design guidelines in the Document manual tab. Let me know what you think!")
                .author(emp2)
                .category("GENERAL")
                .createdAt(LocalDateTime.now().minusDays(1))
                .likesCount(1)
                .likedBy(emp1.getId() + "")
                .imagesJson("[{\"url\":\"https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800\",\"description\":\"New design system typography and component guidelines mockup\"}]")
                .build();

        Post p3 = Post.builder()
                .content("Huge shoutout to David Miller for helping resolve the database backup issue late last night. Absolute life saver!")
                .author(admin)
                .category("KUDOS")
                .kudosReceiver(emp1)
                .kudosType("Team Player")
                .createdAt(LocalDateTime.now().minusHours(4))
                .likesCount(3)
                .likedBy(admin.getId() + "," + emp2.getId() + "," + emp3.getId())
                .imagesJson("[{\"url\":\"https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800\",\"description\":\"Celebrating team success!\"}]")
                .build();

        postRepository.saveAll(Arrays.asList(p1, p2, p3));

        // Groups will be seeded dynamically inside seedNewGroupUsers() to include both default and new custom users.

        // 4. Seed Tasks
        Task t1 = Task.builder()
                .title("Bootstrap Backend & Security")
                .description("Create Spring Boot templates, set up CORS configuration, configure H2 database, and initialize API schema.")
                .status("DONE")
                .priority("High")
                .assignee(emp1)
                .creator(admin)
                .dueDate(LocalDate.now().minusDays(1))
                .build();

        Task t2 = Task.builder()
                .title("Build Workflow Automation Form")
                .description("any text in that progross")
                .status("IN_PROGRESS")
                .priority("High")
                .assignee(admin)
                .creator(emp1)
                .dueDate(LocalDate.now().plusDays(2))
                .build();

        Task t3 = Task.builder()
                .title("Draft Company Security Policies")
                .description("Create a central document guidelines repository in the knowledge base outlining password expirations and network access.")
                .status("TODO")
                .priority("Low")
                .assignee(admin)
                .creator(admin)
                .dueDate(LocalDate.now().plusDays(5))
                .build();

        Task t4 = Task.builder()
                .title("Design Portal Wireframes")
                .description("Design high-fidelity layouts for the workspace feed, Kanban task board, employee directory, and analytics dashboards.")
                .status("DONE")
                .priority("Medium")
                .assignee(emp3)
                .creator(emp2)
                .dueDate(LocalDate.now().minusDays(3))
                .build();

        taskRepository.saveAll(Arrays.asList(t1, t2, t3, t4));

        // 5. Seed Documents (Knowledge manuals & Uploaded files)
        Document d1 = Document.builder()
                .title("Employee Leave Policy")
                .content("Annual Leave allocation:\n\n1. All full-time employees are entitled to 22 paid annual leaves per calendar year.\n2. Leave requests must be submitted via the portal workflow approval page at least 3 days in advance.\n3. A maximum of 5 unused leave days can be carried forward to the next calendar year.")
                .type("MANUAL")
                .uploader(admin)
                .createdAt(LocalDateTime.now().minusDays(10))
                .build();

        Document d2 = Document.builder()
                .title("Code Review Guidelines")
                .content("Our standards for software development:\n\n1. All commits must pass CI lint and test stages.\n2. Every pull request requires at least 1 approval from a senior engineering peer before merge.\n3. Make sure to detail the description, test cases, and breaking changes in PR description.")
                .type("MANUAL")
                .uploader(emp1)
                .createdAt(LocalDateTime.now().minusDays(5))
                .build();

        Document d3 = Document.builder()
                .title("Q2 Marketing Plan.docx")
                .content("Detailed breakdown of marketing targets, social media campaigns, and budget breakdowns for Q2 product launches.")
                .type("FILE")
                .fileName("Q2_Marketing_Plan.docx")
                .fileType("docx")
                .fileSize(452000L) // ~452 KB
                .uploader(emp3)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        Document d4 = Document.builder()
                .title("Platform Architecture Overview.pdf")
                .content("PDF document illustrating microservice design and SQL schema mapping.")
                .type("FILE")
                .fileName("Platform_Architecture_Overview.pdf")
                .fileType("pdf")
                .fileSize(1250000L) // ~1.25 MB
                .uploader(emp1)
                .createdAt(LocalDateTime.now().minusHours(8))
                .build();

        documentRepository.saveAll(Arrays.asList(d1, d2, d3, d4));

        // 6. Seed Workflow requests
        WorkflowRequest wr1 = WorkflowRequest.builder()
                .type("LEAVE")
                .title("Sabbatical Leave Application")
                .description("Requesting 15 days sabbatical leave from Aug 1st to Aug 15th to attend a professional development bootcamp.")
                .status("PENDING")
                .creator(emp1)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        WorkflowRequest wr2 = WorkflowRequest.builder()
                .type("EXPENSE")
                .title("Client Lunch Reimbursement")
                .description("Hosted client dinner at The Capital Grille for Q3 budget alignments. Receipt attached.")
                .status("APPROVED")
                .creator(emp2)
                .reviewer(admin)
                .adminComments("Approved. Receipt matches policy. Reimbursement processed.")
                .createdAt(LocalDateTime.now().minusDays(4))
                .build();

        WorkflowRequest wr3 = WorkflowRequest.builder()
                .type("IT_SUPPORT")
                .title("Laptop Memory Upgrade")
                .description("Requesting RAM upgrade from 16GB to 32GB as local IDE compilation is getting extremely slow.")
                .status("PENDING")
                .creator(emp2)
                .createdAt(LocalDateTime.now().minusHours(12))
                .build();
        workflowRequestRepository.saveAll(Arrays.asList(wr1, wr2, wr3));

        seedEventsIfAbsent();
        seedNewGroupUsers();

        System.out.println(">>> Database Seeded Successfully! <<<");
    }

    private void seedNewGroupUsers() {
        // Group 1
        registerUserIfAbsent("nachiketh@example.com", "nachiketh", "Nachiketh", "Group 1", "ROLE_EMPLOYEE", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", "Active", "Group 1 member");
        registerUserIfAbsent("vardhan@example.com", "vardhan", "Vardhan", "Group 1", "ROLE_EMPLOYEE", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "Active", "Group 1 member");
        registerUserIfAbsent("upendra@example.com", "upendra", "Upendra", "Group 1", "ROLE_EMPLOYEE", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", "Active", "Group 1 member");
        registerUserIfAbsent("venu@example.com", "venu", "Venu", "Group 1", "ROLE_EMPLOYEE", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Active", "Group 1 member");
        registerUserIfAbsent("rehana@example.com", "rehana", "Rehana", "Group 1", "ROLE_EMPLOYEE", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "Active", "Group 1 member");

        // Group 2
        registerUserIfAbsent("yuktha@example.com", "yuktha", "Yuktha", "Group 2", "ROLE_EMPLOYEE", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "Active", "Group 2 member");
        registerUserIfAbsent("shivani@example.com", "shivani", "Shivani", "Group 2", "ROLE_EMPLOYEE", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Active", "Group 2 member");
        registerUserIfAbsent("kavya@example.com", "kavya", "Kavya", "Group 2", "ROLE_EMPLOYEE", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", "Active", "Group 2 member");
        registerUserIfAbsent("yashwanth@example.com", "yashwanth", "Yashwanth", "Group 2", "ROLE_EMPLOYEE", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150", "Active", "Group 2 member");
        registerUserIfAbsent("sreelatha@example.com", "sreelatha", "Sreelatha", "Group 2", "ROLE_EMPLOYEE", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", "Active", "Group 2 member");

        // Fix Yuktha's department in case it was previously seeded as Group 1
        // Also force reset password to ensure she can log in
        userRepository.findByEmail("yuktha@example.com").ifPresent(yuktha -> {
            yuktha.setDepartment("Group 2");
            yuktha.setPassword(passwordEncoder.encode("yuktha"));
            userRepository.save(yuktha);
        });

        // Ensure "Group 1", "Group 2", "All Members" exist without deleting custom user groups
        List<User> allUsers = userRepository.findAll();
        List<String> group1Ids = new ArrayList<>();
        List<String> group2Ids = new ArrayList<>();
        List<String> allIds = new ArrayList<>();

        for (User u : allUsers) {
            String idStr = String.valueOf(u.getId());
            allIds.add(idStr);
            if ("Group 1".equals(u.getDepartment())) {
                group1Ids.add(idStr);
            } else if ("Group 2".equals(u.getDepartment())) {
                group2Ids.add(idStr);
            }
        }

        List<Group> existingGroups = groupRepository.findAll();
        
        Group g1 = existingGroups.stream().filter(g -> "Group 1".equals(g.getName())).findFirst().orElseGet(() -> Group.builder().name("Group 1").description("Discussion space for Group 1 members.").isPrivate(false).pendingRequests("").build());
        Group g2 = existingGroups.stream().filter(g -> "Group 2".equals(g.getName())).findFirst().orElseGet(() -> Group.builder().name("Group 2").description("Discussion space for Group 2 members.").isPrivate(false).pendingRequests("").build());
        Group gAll = existingGroups.stream().filter(g -> "All Members".equals(g.getName())).findFirst().orElseGet(() -> Group.builder().name("All Members").description("Public channel for all users on Zoho Connect.").isPrivate(false).pendingRequests("").build());

        g1.setMembers(String.join(",", group1Ids));
        g2.setMembers(String.join(",", group2Ids));
        gAll.setMembers(String.join(",", allIds));

        groupRepository.saveAll(Arrays.asList(g1, g2, gAll));
    }

    private void registerUserIfAbsent(String email, String rawPassword, String name, String department, String role, String avatarUrl, String status, String bio) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .name(name)
                    .role(role)
                    .department(department)
                    .avatarUrl(avatarUrl)
                    .status(status)
                    .bio(bio)
                    .build();
            userRepository.save(user);
        }
    }

    private void seedEventsIfAbsent() {
        if (eventRepository.count() == 0) {
            Optional<User> adminOpt = userRepository.findByEmail("admin@company.com");
            if (adminOpt.isEmpty()) {
                return; // Admin not found, cannot seed events
            }
            User admin = adminOpt.get();

            Event ev1 = Event.builder()
                    .title("Sprint Planning & Sync")
                    .description("Bi-weekly sprint planning and roadmap alignment meeting with the engineering and product team.")
                    .eventDate(LocalDateTime.of(2026, 7, 7, 10, 0))
                    .location("Conference Room A / Teams")
                    .rsvps("1,2")
                    .creator(admin)
                    .build();

            Event ev2 = Event.builder()
                    .title("IMPORTANT MEETING")
                    .description("Urgent company-wide operational sync regarding Q3 roadmap changes and planning.")
                    .eventDate(LocalDateTime.of(2026, 7, 7, 22, 51))
                    .location("VIRTUAL")
                    .rsvps("")
                    .creator(admin)
                    .build();

            Event ev3 = Event.builder()
                    .title("Q3 Company Town Hall")
                    .description("Quarterly all-hands town hall meeting with executive updates, Q2 recap, and product roadmap walkthrough.")
                    .eventDate(LocalDateTime.of(2026, 7, 8, 11, 0))
                    .location("Main Auditorium & Stream")
                    .rsvps("1,2,3")
                    .creator(admin)
                    .build();

            Event ev4 = Event.builder()
                    .title("HR Onboarding Workshop")
                    .description("Onboarding and welcome session for new hires joining this week.")
                    .eventDate(LocalDateTime.of(2026, 7, 10, 10, 0))
                    .location("Training Room B")
                    .rsvps("3")
                    .creator(admin)
                    .build();

            Event ev5 = Event.builder()
                    .title("Q2 Budget Review")
                    .description("Finance review meeting to align department budgets for the next quarter.")
                    .eventDate(LocalDateTime.of(2026, 7, 12, 13, 30))
                    .location("Boardroom")
                    .rsvps("1")
                    .creator(admin)
                    .build();

            Event ev6 = Event.builder()
                    .title("Tech Stack Migration")
                    .description("Developer talk on architecture plans for shifting services to modern React framework.")
                    .eventDate(LocalDateTime.of(2026, 7, 14, 16, 0))
                    .location("Teams")
                    .rsvps("2")
                    .creator(admin)
                    .build();

            Event ev7 = Event.builder()
                    .title("July Birthday Celebration")
                    .description("Monthly celebration for all employees born in July.")
                    .eventDate(LocalDateTime.of(2026, 7, 8, 15, 0))
                    .location("Cafeteria")
                    .rsvps("1,2,3,4,5")
                    .creator(admin)
                    .build();

            Event ev8 = Event.builder()
                    .title("Annual Awards Gala")
                    .description("Product design sync for next year planning.")
                    .eventDate(LocalDateTime.of(2026, 7, 8, 18, 0))
                    .location("Teams")
                    .rsvps("1,2,4")
                    .creator(admin)
                    .build();

            eventRepository.saveAll(Arrays.asList(ev1, ev2, ev3, ev4, ev5, ev6, ev7, ev8));
        }
    }
}
