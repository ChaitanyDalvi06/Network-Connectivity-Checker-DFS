# Use official Java runtime image
FROM eclipse-temurin:21-jre

# Set working directory
WORKDIR /app

# Copy all Java source files
COPY *.java ./

# Compile Java files
RUN javac *.java

# Set port environment variable
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "Main"]
