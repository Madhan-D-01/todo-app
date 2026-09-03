package com.example.TodoListBackend.controllers;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.TodoListBackend.dto.TaskRequest;
import com.example.TodoListBackend.dto.TaskResponse;
import com.example.TodoListBackend.dto.UserResponse;
import com.example.TodoListBackend.models.Task;
import com.example.TodoListBackend.models.User;
import com.example.TodoListBackend.repositories.UserRepository;
import com.example.TodoListBackend.services.TaskService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {
	@Autowired
	private TaskService taskService;

	@Autowired
	private UserRepository userRepository;

	private TaskResponse toResponse(Task task) {
		return new TaskResponse(task.getId(), task.getTask(), task.isCompleted(), task.getStartDate(),
				task.getEndDate(), task.getUser() != null ? task.getUser().getId() : null);
	}

	private List<TaskResponse> toResponseList(List<Task> tasks) {
		return tasks.stream().map(task -> this.toResponse(task)).collect(Collectors.toList());
	}

	@GetMapping
	public ResponseEntity<List<TaskResponse>> getAllTasks() {
		return new ResponseEntity<>(toResponseList(taskService.getAllTask()), HttpStatus.OK);
	}

	@GetMapping("/{userId}")
	public ResponseEntity<List<TaskResponse>> getTasksByUserId(@PathVariable Long userId) {

		List<Task> tasks = taskService.findTasksByUserId(userId);

		return ResponseEntity.ok(toResponseList(tasks));
	}

	@GetMapping("/completed")
	public ResponseEntity<List<TaskResponse>> getAllCompletedTasks() {
		return new ResponseEntity<>(toResponseList(taskService.findByAllCompletedTask()), HttpStatus.OK);
	}

	@GetMapping("/incompleted")
	public ResponseEntity<List<TaskResponse>> getAllInCompletedTasks() {
		return new ResponseEntity<>(toResponseList(taskService.findByAllInCompletedTask()), HttpStatus.OK);
	}

	@PostMapping
	public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest request) {
		User user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUserId()));

		Task task = Task.builder().task(request.getTask()).completed(request.isCompleted())
				.startDate(request.getStartDate()).endDate(request.getEndDate()).user(user)

				.build();
		Task saved = taskService.createNewTask(task);
		return new ResponseEntity<>(toResponse(saved), HttpStatus.CREATED);
	}

	@PutMapping("/{id}")
	public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id, @RequestBody TaskRequest request) {
		User user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getUserId()));

		Task task = Task.builder().id(id).task(request.getTask()).completed(request.isCompleted())
				.startDate(request.getStartDate()).endDate(request.getEndDate()).user(user).build();

		Task updated = taskService.updateTask(task);
		return new ResponseEntity<>(toResponse(updated), HttpStatus.OK);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
		taskService.deleteTaskById(id);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}

}
