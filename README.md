# Cochin Computing Final Task: Employee Management API

## Objective

This project is a RESTful API built in Node.js using TypeScript, designed to manage employee records. It interacts with a SQL Server database, adhering to principles of Clean Architecture, Object-Oriented Programming (OOP), and Dependency Injection (DI).

## Features

The API provides the following functionality:

* **CRUD Operations:** Create, Read, Update, and Delete employee records.
* **Database Interaction:** Utilizes SQL Server as the persistent storage.
* **Stored Procedures:** All database interactions for CRUD operations are performed via stored procedures.
* **Automatic Audit Logging:** Data changes on the `Employees` table are automatically logged to an `AuditLogs` table using database triggers.
* **Salary Range Search:** Allows fetching employees based on a specified salary range.
* **RESTful Endpoints:** Provides a well-defined set of HTTP endpoints for interaction.
* **Clean Architecture:** Structured into distinct layers (Core, Infrastructure, Interface) for better separation of concerns.
* **OOP & Dependency Injection:** Implemented using classes and managing dependencies through injection.

## Prerequisites

Before running this project, ensure you have the following installed:

* Node.js (LTS version recommended)
* npm (Node Package Manager, comes with Node.js)
* TypeScript (`npm install -g typescript`)
* SQL Server or Azure SQL Database instance
* A SQL client tool (like SQL Server Management Studio or Azure Data Studio) to set up the database.

## Setup

1.  **Clone the Repository:**
    ```bash
    # If using git
    # git clone <repository_url>
    # cd <project_directory>
    ```
    (Assuming you already have the code files in your local directory)

2.  **Install Dependencies:**
    Navigate to the project root directory in your terminal and run:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project directory and add your database connection details:
    ```env
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_SERVER=your_db_server_address # e.g., localhost, 127.0.0.1, your_azure_sql_server.database.windows.net
    DB_DATABASE=your_database_name
    PORT=3000 # Or your desired port
    ```
    If connecting to Azure SQL Database, ensure `encrypt=true` and `trustServerCertificate=true` (for development) are handled in `src/infrastructure/database/db.ts`. Also, ensure Public Network Access is enabled and your client IP is in the Azure SQL Firewall rules.

4.  **Database Setup:**
    Connect to your SQL Server or Azure SQL Database using a SQL client tool. Execute the SQL scripts provided in the task description to:
    * Create the `Employees` table.
    * Create the `AuditLogs` table.
    * Create the `CreateEmployee`, `GetEmployees`, `UpdateEmployee`, `DeleteEmployee`, and `GetEmployeesBySalaryRange` stored procedures.
    * Create the `trg_AuditLogs` trigger.

## Running the Application

1.  **Compile TypeScript:**
    ```bash
    tsc
    ```
    (This compiles the TypeScript code from `src` into JavaScript in the `dist` folder)

2.  **Start the Server:**
    ```bash
    node dist/index.js
    ```
    Alternatively, if you are using `ts-node-dev` or `nodemon` for automatic restarts during development:
    ```bash
    # Using ts-node-dev
    ts-node-dev --respawn src/index.ts
    # Using nodemon with ts-node (if configured)
    # nodemon src/index.ts
    ```

The server should start and connect to the database. You will see messages indicating the database connection status and the port the server is listening on.

## API Endpoints

The API is accessible at `http://localhost:PORT/api/employees` (replace PORT with your configured port, typically 3000).

You can use tools like Postman, Insomnia, or `curl` to test the endpoints.

### 1. Create Employee

* **URL:** `/api/employees`
* **Method:** `POST`
* **Description:** Creates a new employee record.
* **Request Body (JSON):**
    ```json
    {
        "name": "Jane Smith",
        "position": "Data Analyst",
        "salary": 80000.75,
        "createdBy": "api_user"
    }
    ```
* **Success Response:** `201 Created` with the created employee object including its assigned `id`.
* **Error Responses:** `400 Bad Request` (e.g., missing required fields), `500 Internal Server Error`.

### 2. Get All Employees

* **URL:** `/api/employees`
* **Method:** `GET`
* **Description:** Retrieves all employee records from the database.
* **Request Body:** None
* **Success Response:** `200 OK` with a JSON array of employee objects.
* **Error Responses:** `500 Internal Server Error`.

### 3. Update Employee

* **URL:** `/api/employees/:id` (Replace `:id` with the employee's ID)
* **Method:** `PUT`
* **Description:** Updates an existing employee record.
* **Request Body (JSON):**
    ```json
    {
        "id": 1, // Must match the ID in the URL
        "name": "Jane Smith Updated",
        "position": "Senior Data Analyst",
        "salary": 95000.00,
        "updatedBy": "api_user"
    }
    ```
* **Success Response:** `200 OK` with the updated employee object.
* **Error Responses:** `404 Not Found` (if employee ID does not exist), `400 Bad Request`, `500 Internal Server Error`.

### 4. Delete Employee

* **URL:** `/api/employees/:id` (Replace `:id` with the employee's ID)
* **Method:** `DELETE`
* **Description:** Deletes an employee record.
* **Request Body (JSON):**
    ```json
    {
        "deletedBy": "api_user"
    }
    ```
    *(Note: The `deletedBy` field is included in the body based on the task description and current implementation, but typically user information for deletion would come from authentication/headers.)*
* **Success Response:** `204 No Content`.
* **Error Responses:** `404 Not Found` (if employee ID does not exist), `400 Bad Request`, `500 Internal Server Error`.

### 5. Get Employees by Salary Range

* **URL:** `/api/employees/salary-range`
* **Method:** `GET`
* **Description:** Retrieves employees whose salary falls within a specified range.
* **Query Parameters:**
    * `minSalary`: Minimum salary (e.g., `70000`)
    * `maxSalary`: Maximum salary (e.g., `100000`)
* **Example URL:** `/api/employees/salary-range?minSalary=70000&maxSalary=100000`
* **Success Response:** `200 OK` with a JSON array of employee objects within the salary range.
* **Error Responses:** `400 Bad Request` (if min/max salary are invalid), `500 Internal Server Error`.

## Architecture Overview

The project follows a basic **Clean Architecture** pattern:

* **Core Layer:** Contains the domain entities (`Employee`) and use case interfaces/implementations (`IEmployeeUseCase`, `EmployeeUseCase`) defining the business logic.
* **Infrastructure Layer:** Contains components that interact with external concerns, specifically the database (`db.ts`, `IEmployeeRepository`, `EmployeeRepository`). It implements the repository interfaces defined in the Core layer.
* **Interface Layer:** Handles external interactions, specifically the API controllers (`EmployeeController`) and routing (`EmployeeRouter`). It uses the use cases from the Core layer.

**Object-Oriented Programming (OOP)** is used throughout by defining classes for entities, repositories, use cases, and controllers.

**Dependency Injection (DI)** is implemented (in the simplified approach within `EmployeeRouter.ts`) by creating instances of lower-level components (Repository) and passing them into the constructors of higher-level components (Use Case, Controller).

## Notes

* **Authentication/Authorization:** The `createdBy`, `updatedBy`, and `deletedBy` fields are currently taken directly from the request body. In a production application, this information should be securely obtained from an authentication and authorization system.
* **Audit Trigger Detail:** The provided SQL trigger `trg_AuditLogs` on DELETE operations logs the `CreatedBy` from the `deleted` row in the `AuditLogs` table. This means the audit log records who originally created the employee, not the user who performed the delete via the API/stored procedure. Adjust the trigger/SP if you need to log the actual deleter.
