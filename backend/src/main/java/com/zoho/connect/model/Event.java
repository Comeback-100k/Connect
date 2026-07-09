package com.zoho.connect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private LocalDateTime eventDate;
    private String location;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(length = 2000)
    private String rsvps; // Comma-separated user IDs
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public User getCreator() { return creator; }
    public void setCreator(User creator) { this.creator = creator; }
    public String getRsvps() { return rsvps; }
    public void setRsvps(String rsvps) { this.rsvps = rsvps; }

    public Event() {}

    public Event(Long id, String title, String description, LocalDateTime eventDate, String location, User creator, String rsvps) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.location = location;
        this.creator = creator;
        this.rsvps = rsvps;
    }

    public static EventBuilder builder() { return new EventBuilder(); }
    public static class EventBuilder {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime eventDate;
        private String location;
        private User creator;
        private String rsvps;
        public EventBuilder id(Long id) { this.id = id; return this; }
        public EventBuilder title(String title) { this.title = title; return this; }
        public EventBuilder description(String description) { this.description = description; return this; }
        public EventBuilder eventDate(LocalDateTime eventDate) { this.eventDate = eventDate; return this; }
        public EventBuilder location(String location) { this.location = location; return this; }
        public EventBuilder creator(User creator) { this.creator = creator; return this; }
        public EventBuilder rsvps(String rsvps) { this.rsvps = rsvps; return this; }

        public Event build() {
            Event obj = new Event();
            obj.id = this.id;
            obj.title = this.title;
            obj.description = this.description;
            obj.eventDate = this.eventDate;
            obj.location = this.location;
            obj.creator = this.creator;
            obj.rsvps = this.rsvps;
            return obj;
        }
    }
}
