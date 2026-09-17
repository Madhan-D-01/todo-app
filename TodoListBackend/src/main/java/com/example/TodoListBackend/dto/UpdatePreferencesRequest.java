package com.example.TodoListBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UpdatePreferencesRequest {
	private boolean darkMode;
	private boolean emailNotifications;
	private boolean pushNotifications;
}
