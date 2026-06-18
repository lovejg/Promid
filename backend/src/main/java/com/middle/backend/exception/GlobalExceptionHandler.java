package com.middle.backend.exception;

import com.middle.backend.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // 모든 컨트롤러에서 던져진 예외는 여기서 가로챔
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class) // 이 타입의 예외는 이 메서드가 담당
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        ErrorResponse body = new ErrorResponse(400, e.getMessage());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getAllErrors().get(0).getDefaultMessage(); // MVP니까 일단 첫 메세지 하나만 뽑기
        ErrorResponse body = new ErrorResponse(400, message);
        return ResponseEntity.badRequest().body(body);
    }
}
