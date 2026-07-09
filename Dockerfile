# Stage 1: Build the backend application
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src
COPY backend/.mvn ./backend/.mvn
COPY backend/mvnw ./backend/
RUN chmod +x backend/mvnw
WORKDIR /app/backend
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/backend/target/connect-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
