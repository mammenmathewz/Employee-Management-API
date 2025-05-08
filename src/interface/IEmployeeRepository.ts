import { Employee } from '../core/entities/Employee';


export interface IEmployeeRepository {
    create(employee: Employee, createdBy: string): Promise<Employee>;
    findAll(): Promise<Employee[]>;
    findById(id: number): Promise<Employee | null>; 
    update(employee: Employee, updatedBy: string): Promise<Employee>;
    delete(id: number, deletedBy: string): Promise<void>;
    findBySalaryRange(minSalary: number, maxSalary: number): Promise<Employee[]>;
}