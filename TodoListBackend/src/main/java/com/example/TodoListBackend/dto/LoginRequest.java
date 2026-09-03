package com.example.TodoListBackend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class LoginRequest {
	@NotBlank(message = "Useremail is required")
	private String email;

	@NotBlank(message = "Password is required")
	private String password;
}
