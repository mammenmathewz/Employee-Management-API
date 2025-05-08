// src/infrastructure/repositories/EmployeeRepository.ts
import { IEmployeeRepository } from '../../interface/IEmployeeRepository';
import { Employee } from '../../core/entities/Employee';
import { connectDB } from '../database/db';
import sql from 'mssql';


export class EmployeeRepository implements IEmployeeRepository {

    async create(employee: Employee, createdBy: string): Promise<Employee> {
        // Get the connection pool instance
        const pool = await connectDB();
        try {
            const request = pool.request();
            request.input('Name', sql.NVarChar(100), employee.name);
            request.input('Position', sql.NVarChar(100), employee.position);
            request.input('Salary', sql.Decimal(10, 2), employee.salary);
            request.input('CreatedBy', sql.NVarChar(100), createdBy);

            await request.execute('CreateEmployee');

            // After inserting, query to get the created employee with its database-assigned ID
            // This assumes Name, Position, and Salary combination is reasonably unique recently,
            // or your stored procedure returns the ID upon insertion (preferred method).
             const result = await pool.request()
                .input('Name', sql.NVarChar(100), employee.name)
                .input('Position', sql.NVarChar(100), employee.position)
                .input('Salary', sql.Decimal(10, 2), employee.salary)
                // Assuming CreatedAt is automatically set and increases, order by it
                .query(`SELECT TOP 1 Id, Name, Position, Salary FROM Employees WHERE Name = @Name AND Position = @Position AND Salary = @Salary ORDER BY CreatedAt DESC`);

            if (result.recordset.length > 0) {
                const createdEmployeeData = result.recordset[0];
                return new Employee(createdEmployeeData.Id, createdEmployeeData.Name, createdEmployeeData.Position, createdEmployeeData.Salary);
            } else {
                // This indicates an issue if the insert was successful but retrieval failed
                throw new Error("Could not retrieve created employee after insertion.");
            }

        } catch (err) {
            console.error('Error creating employee:', err);
            throw err; // Re-throw the error for the use case to handle
        }
    }

    async findAll(): Promise<Employee[]> {
         // Get the connection pool instance
        const pool = await connectDB();
        try {
            const result = await pool.request().execute('GetEmployees');
            // Explicitly type the record parameter for clarity
            return result.recordset.map((record: { Id: number; Name: string; Position: string; Salary: number; }) => new Employee(record.Id, record.Name, record.Position, record.Salary));
        } catch (err) {
            console.error('Error fetching all employees:', err);
            throw err;
        }
    }

    async findById(id: number): Promise<Employee | null> {
         // Get the connection pool instance
         const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('Id', sql.Int, id)
                // Assuming you don't have a GetEmployeeById SP, using a direct query
                .query('SELECT Id, Name, Position, Salary FROM Employees WHERE Id = @Id');

            if (result.recordset.length > 0) {
                const record = result.recordset[0];
                return new Employee(record.Id, record.Name, record.Position, record.Salary);
            }
            return null; // Employee not found

        } catch (err) {
            console.error(`Error fetching employee with id ${id}:`, err);
            throw err;
        }
    }


    async update(employee: Employee, updatedBy: string): Promise<Employee> {
         // Get the connection pool instance
        const pool = await connectDB();
        try {
            // Optional: Check if employee exists before attempting update
             const existingEmployee = await this.findById(employee.id);
             if (!existingEmployee) {
                 // Throw an error if the employee doesn't exist to signal a 404
                 const notFoundError = new Error(`Employee with ID ${employee.id} not found for update.`);
                 (notFoundError as any).statusCode = 404; // Add a status code property for potential error handling in controller/middleware
                 throw notFoundError;
             }

            const request = pool.request();
            request.input('Id', sql.Int, employee.id);
            request.input('Name', sql.NVarChar(100), employee.name);
            request.input('Position', sql.NVarChar(100), employee.position);
            request.input('Salary', sql.Decimal(10, 2), employee.salary);
            // Note: Your SP uses CreatedBy for update too. If you intend a dedicated UpdatedBy,
            // you might need to adjust the SP and table schema. Using 'CreatedBy' param as is.
            request.input('UpdatedBy', sql.NVarChar(100), updatedBy); // Passing updatedBy to the SP parameter named 'CreatedBy'

            await request.execute('UpdateEmployee');

            // Return the updated employee object, assuming the update was successful
            return employee;

        } catch (err) {
            console.error(`Error updating employee with id ${employee.id}:`, err);
             // Re-throw if it's our custom not found error
             if ((err as any).statusCode === 404) throw err;
            throw err; // Re-throw other errors
        }
    }

    async delete(id: number, deletedBy: string): Promise<void> {
         // Get the connection pool instance
        const pool = await connectDB();
        try {
             // Optional: Check if employee exists before attempting delete
             const existingEmployee = await this.findById(id);
             if (!existingEmployee) {
                  // Throw an error if the employee doesn't exist to signal a 404
                 const notFoundError = new Error(`Employee with ID ${id} not found for deletion.`);
                 (notFoundError as any).statusCode = 404; // Add a status code property
                 throw notFoundError;
             }

            const request = pool.request();
            request.input('Id', sql.Int, id);
            request.input('DeletedBy', sql.NVarChar(100), deletedBy); // Passing deletedBy to the SP parameter

            await request.execute('DeleteEmployee');

             // Note on Auditing: Your trigger `trg_AuditLogs` on DELETE selects `CreatedBy` from the `deleted` table.
             // This means the audit log will record the *original creator* as the one who performed the delete,
             // not the user specified by `@DeletedBy` passed to the SP.
             // To fix this, you could modify the trigger or pass the `deletedBy` information differently
             // (e.g., via a temporary table or context variable, which is more advanced SQL).
             // As is, the `@DeletedBy` in your SP is not used by the audit trigger for DELETE operations.


        } catch (err) {
            console.error(`Error deleting employee with id ${id}:`, err);
             // Re-throw if it's our custom not found error
             if ((err as any).statusCode === 404) throw err;
            throw err; // Re-throw other errors
        }
    }

    async findBySalaryRange(minSalary: number, maxSalary: number): Promise<Employee[]> {
         // Get the connection pool instance
        const pool = await connectDB();
        try {
            const request = pool.request();
            request.input('MinSalary', sql.Decimal(10, 2), minSalary);
            request.input('MaxSalary', sql.Decimal(10, 2), maxSalary);

            const result = await request.execute('GetEmployeesBySalaryRange');
             // Explicitly type the record parameter for clarity
            return result.recordset.map((record: { Id: number; Name: string; Position: string; Salary: number; }) => new Employee(record.Id, record.Name, record.Position, record.Salary));

        } catch (err) {
            console.error(`Error fetching employees by salary range (${minSalary} - ${maxSalary}):`, err);
            throw err;
        }
    }
}