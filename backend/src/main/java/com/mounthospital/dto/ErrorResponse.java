package com.mounthospital.dto;

public class ErrorResponse {
    private String message;
    private String error;

    public ErrorResponse() {}

    public ErrorResponse(String message) {
        this.message = message;
        this.error = message;
    }

    public ErrorResponse(String message, String error) {
        this.message = message;
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
