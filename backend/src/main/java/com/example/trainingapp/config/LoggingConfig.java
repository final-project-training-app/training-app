package com.example.trainingapp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class LoggingConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoggingInterceptor());
    }

    public static class LoggingInterceptor implements HandlerInterceptor {
        private static final Logger logger = LoggerFactory.getLogger(LoggingInterceptor.class);
        private static final Runtime runtime = Runtime.getRuntime();

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            long usedMemory = getUsedMemory();
            long totalMemory = getTotalMemory();
            long freeMemory = getFreeMemory();
            
            logger.info(">>> REQUEST: {} {} | IP: {} | Memory: {}MB / {}MB (Free: {}MB)",
                    request.getMethod(),
                    request.getRequestURI(),
                    request.getRemoteAddr(),
                    usedMemory,
                    totalMemory,
                    freeMemory);
            
            request.setAttribute("startTime", System.currentTimeMillis());
            request.setAttribute("startMemory", usedMemory);
            return true;
        }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                Exception ex) {
            long startTime = (long) request.getAttribute("startTime");
            long startMemory = (long) request.getAttribute("startMemory");
            long duration = System.currentTimeMillis() - startTime;
            long endMemory = getUsedMemory();
            long memoryDelta = endMemory - startMemory;
            long totalMemory = getTotalMemory();
            long freeMemory = getFreeMemory();
            
            String memoryChange = memoryDelta >= 0 ? "+" + memoryDelta : String.valueOf(memoryDelta);
            
            logger.info("<<< RESPONSE: {} {} | Status: {} | Duration: {}ms | Memory: {}MB / {}MB (Delta: {}MB, Free: {}MB)",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    duration,
                    endMemory,
                    totalMemory,
                    memoryChange,
                    freeMemory);
            
            if (ex != null) {
                logger.error("Exception occurred: ", ex);
            }
            
            // Warn if memory usage is high
            if (endMemory > totalMemory * 0.85) {
                logger.warn("⚠️  HIGH MEMORY USAGE: {}% of heap used",
                        (int)((double)endMemory / totalMemory * 100));
            }
        }

        private long getUsedMemory() {
            return (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024);
        }

        private long getTotalMemory() {
            return runtime.totalMemory() / (1024 * 1024);
        }

        private long getFreeMemory() {
            return runtime.freeMemory() / (1024 * 1024);
        }
    }
}