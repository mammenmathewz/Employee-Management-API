
import { IEmployeeRepository } from '../../interface/IEmployeeRepository';
import { Employee } from '../../core/entities/Employee';
import { connectDB } from '../database/db';
import sql from 'mssql';


export class EmployeeRepository implements IEmployeeRepository {

    async create(employee: Employee, createdBy: string): Promise<Employee> {
        const pool = await connectDB();
        try {
            const request = pool.request();
            request.input('Name', sql.NVarChar(100), employee.name);
            request.input('Position', sql.NVarChar(100), employee.position);
            request.input('Salary', sql.Decimal(10, 2), employee.salary);
            request.input('CreatedBy', sql.NVarChar(100), createdBy);

            await request.execute('CreateEmployee');

             const result = await pool.request()
                .input('Name', sql.NVarChar(100), employee.name)
                .input('Position', sql.NVarChar(100), employee.position)
                .input('Salary', sql.Decimal(10, 2), employee.salary)
                .query(`SELECT TOP 1 Id, Name, Position, Salary FROM Employees WHERE Name = @Name AND Position = @Position AND Salary = @Salary ORDER BY CreatedAt DESC`);

            if (result.recordset.length > 0) {
                const createdEmployeeData = result.recordset[0];
                return new Employee(createdEmployeeData.Id, createdEmployeeData.Name, createdEmployeeData.Position, createdEmployeeData.Salary);
            } else {
                throw new Error("Could not retrieve created employee after insertion.");
            }

        } catch (err) {
            console.error('Error creating employee:', err);
            throw err; 
        }
    }

    async findAll(): Promise<Employee[]> {
        const pool = await connectDB();
        try {
            const result = await pool.request().execute('GetEmployees');
            return result.recordset.map((record: { Id: number; Name: string; Position: string; Salary: number; }) => new Employee(record.Id, record.Name, record.Position, record.Salary));
        } catch (err) {
            console.error('Error fetching all employees:', err);
            throw err;
        }
    }

    async findById(id: number): Promise<Employee | null> {
         const pool = await connectDB();
        try {
            const result = await pool.request()
                .input('Id', sql.Int, id)
                .query('SELECT Id, Name, Position, Salary FROM Employees WHERE Id = @Id');

            if (result.recordset.length > 0) {
                const record = result.recordset[0];
                return new Employee(record.Id, record.Name, record.Position, record.Salary);
            }
            return null; 

        } catch (err) {
            console.error(`Error fetching employee with id ${id}:`, err);
            throw err;
        }
    }


    async update(employee: Employee, updatedBy: string): Promise<Employee> {
        const pool = await connectDB();
        try {
             const existingEmployee = await this.findById(employee.id);
             if (!existingEmployee) {
                 const notFoundError = new Error(`Employee with ID ${employee.id} not found for update.`);
                 (notFoundError as any).statusCode = 404; 
                 throw notFoundError;
             }

            const request = pool.request();
            request.input('Id', sql.Int, employee.id);
            request.input('Name', sql.NVarChar(100), employee.name);
            request.input('Position', sql.NVarChar(100), employee.position);
            request.input('Salary', sql.Decimal(10, 2), employee.salary);

            request.input('UpdatedBy', sql.NVarChar(100), updatedBy); 

            await request.execute('UpdateEmployee');
            return employee;

        } catch (err) {
            console.error(`Error updating employee with id ${employee.id}:`, err);
    
             if ((err as any).statusCode === 404) throw err;
            throw err; // Re-throw other errors
        }
    }

    async delete(id: number, deletedBy: string): Promise<void> {
        const pool = await connectDB();
        try {
             const existingEmployee = await this.findById(id);
             if (!existingEmployee) {
                 const notFoundError = new Error(`Employee with ID ${id} not found for deletion.`);
                 (notFoundError as any).statusCode = 404; 
                 throw notFoundError;
             }

            const request = pool.request();
            request.input('Id', sql.Int, id);
            request.input('DeletedBy', sql.NVarChar(100), deletedBy); 

            await request.execute('DeleteEmployee');

        } catch (err) {
            console.error(`Error deleting employee with id ${id}:`, err);
             if ((err as any).statusCode === 404) throw err;
            throw err; 
        }
    }

    async findBySalaryRange(minSalary: number, maxSalary: number): Promise<Employee[]> {
    
        const pool = await connectDB();
        try {
            const request = pool.request();
            request.input('MinSalary', sql.Decimal(10, 2), minSalary);
            request.input('MaxSalary', sql.Decimal(10, 2), maxSalary);

            const result = await request.execute('GetEmployeesBySalaryRange');
        
            return result.recordset.map((record: { Id: number; Name: string; Position: string; Salary: number; }) => new Employee(record.Id, record.Name, record.Position, record.Salary));

        } catch (err) {
            console.error(`Error fetching employees by salary range (${minSalary} - ${maxSalary}):`, err);
            throw err;
        }
    }
}

 // Note on Auditing: Your trigger `trg_AuditLogs` on DELETE selects `CreatedBy` from the `deleted` table.
             // This means the audit log will record the *original creator* as the one who performed the delete,
             // not the user specified by `@DeletedBy` passed to the SP.
             // To fix this, you could modify the trigger or pass the `deletedBy` information differently
             // (e.g., via a temporary table or context variable, which is more advanced SQL).
             // As is, the `@DeletedBy` in your SP is not used by the audit trigger for DELETE operations.
