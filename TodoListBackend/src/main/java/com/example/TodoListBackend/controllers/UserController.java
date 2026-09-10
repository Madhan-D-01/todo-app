package com.example.TodoListBackend.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.TodoListBackend.dto.LoginRequest;
import com.example.TodoListBackend.dto.LoginResponse;
import com.example.TodoListBackend.dto.UpdateProfileRequest;
import com.example.TodoListBackend.dto.UserResponse;
import com.example.TodoListBackend.models.User;
import com.example.TodoListBackend.security.JwtUtil;
import com.example.TodoListBackend.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
	@Autowired
	private UserService userService;
	@Autowired
	private JwtUtil jwtUtil;

	private UserResponse toResponse(User user) {
		return new UserResponse(user.getId(),
				user.getUsername(),
				user.getEmail(),
				user.getFirstName(),
				user.getLastName(),
				user.getAvatarUrl()
				);
	}

	@PostMapping("/register")
	public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody User user) {
		User savedUser = userService.createUser(user);
		return new ResponseEntity<>(toResponse(savedUser), HttpStatus.CREATED);
	}

	@GetMapping("/{id}")
	public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
		return userService.getUserById(id).map(value -> new ResponseEntity<>(toResponse(value), HttpStatus.OK))
				.orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
	}

	@GetMapping("/username/{username}")
	public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username) {
		return userService.getUserByUserName(username)
				.map(value -> new ResponseEntity<>(toResponse(value), HttpStatus.OK))
				.orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
		Optional<User> user = userService.login(request.getEmail(), request.getPassword());

		if (user.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
		}
		String token = jwtUtil.generateToken(user.get().getUsername());
		return new ResponseEntity<>(new LoginResponse(token, user.get().getEmail()), HttpStatus.OK);

	}
	@GetMapping("/me")
	public ResponseEntity<UserResponse> getCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String username = (String) auth.getPrincipal();

		return userService.getUserByUserName(username)
				.map(u -> new ResponseEntity<>(toResponse(u), HttpStatus.OK))
				.orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
	}
	@PutMapping("/me")
	public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String username = (String) auth.getPrincipal();
		User updated = userService.updateProfile(username, request);
		return new ResponseEntity<>(toResponse(updated), HttpStatus.OK);
	}
}

