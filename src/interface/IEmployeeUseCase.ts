
import { Employee } from '../core/entities/Employee';


export interface IEmployeeUseCase {
    createEmployee(name: string, position: string, salary: number, createdBy: string): Promise<Employee>;
    getEmployees(): Promise<Employee[]>;
    updateEmployee(id: number, name: string, position: string, salary: number, updatedBy: string): Promise<Employee>;
    deleteEmployee(id: number, deletedBy: string): Promise<void>;
    getEmployeesBySalaryRange(minSalary: number, maxSalary: number): Promise<Employee[]>;
}