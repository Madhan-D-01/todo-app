package com.example.TodoListBackend.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class TaskRequest {
	private String task;
	private boolean completed;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	private Long userId;
}
