import { IEmployeeUseCase } from '../../interface/IEmployeeUseCase';
import { IEmployeeRepository } from '../../interface/IEmployeeRepository';
import { Employee } from '../entities/Employee';


export class EmployeeUseCase implements IEmployeeUseCase {
    private employeeRepository: IEmployeeRepository;

    constructor(employeeRepository: IEmployeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    async createEmployee(name: string, position: string, salary: number, createdBy: string): Promise<Employee> {
        if (!name || !position || salary == null || salary < 0 || !createdBy) {
            throw new Error('Invalid employee data provided.');
        }
        const newEmployee = new Employee(0, name, position, salary); 
        return this.employeeRepository.create(newEmployee, createdBy);
    }

    async getEmployees(): Promise<Employee[]> {
        return this.employeeRepository.findAll();
    }

    async updateEmployee(id: number, name: string, position: string, salary: number, updatedBy: string): Promise<Employee> {
        
         if (!id || !name || !position || salary == null || salary < 0 || !updatedBy) {
            throw new Error('Invalid employee data provided for update.');
        }
        const employeeToUpdate = new Employee(id, name, position, salary);
        return this.employeeRepository.update(employeeToUpdate, updatedBy);
    }

    async deleteEmployee(id: number, deletedBy: string): Promise<void> {
         if (!id || !deletedBy) {
            throw new Error('Invalid data provided for deletion.');
        }
        return this.employeeRepository.delete(id, deletedBy);
    }

    async getEmployeesBySalaryRange(minSalary: number, maxSalary: number): Promise<Employee[]> {
         if (minSalary == null || minSalary < 0 || maxSalary == null || maxSalary < 0 || minSalary > maxSalary) {
            throw new Error('Invalid salary range provided.');
        }
        return this.employeeRepository.findBySalaryRange(minSalary, maxSalary);
    }
}