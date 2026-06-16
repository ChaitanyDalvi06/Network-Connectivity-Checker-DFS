# Use official Java development kit (includes compiler)
FROM eclipse-temurin:21-jdk AS builder

# Set working directory
WORKDIR /app

# Copy backend Java files
COPY backend/*.java ./

# Compile Java files
RUN javac *.java

# ============================================
# Runtime stage - use JRE for smaller image
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy compiled classes from builder stage
COPY --from=builder /app/*.class ./

# Set port environment variable
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "Main"]
