// src/controllers/EmployeeController.ts
// Import NextFunction
import { Request, Response, NextFunction } from 'express';
// Assuming IEmployeeUseCase is in the core/usecase folder based on earlier structure
import { IEmployeeUseCase } from '../interface/IEmployeeUseCase'; // Corrected import path based on common structure


export class EmployeeController {
    private employeeUseCase: IEmployeeUseCase;

    // Dependency Injection: The use case is injected into the controller
    constructor(employeeUseCase: IEmployeeUseCase) {
        this.employeeUseCase = employeeUseCase;
    }

    // Added next: NextFunction and changed return type annotation to Promise<void>
    createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, position, salary, createdBy } = req.body;
            if (!createdBy) {
                 res.status(400).json({ message: 'CreatedBy user is required.' });
                 return; // Ensure response is sent and function exits
            }

            const employee = await this.employeeUseCase.createEmployee(name, position, salary, createdBy);
            res.status(201).json(employee); // Send response
            // No explicit return needed as it's void, but async functions implicitly return Promise<void>

        } catch (error: any) {
            console.error('Error in createEmployee controller:', error);
             if (error.message.includes('Invalid employee data')) {
                res.status(400).json({ message: error.message });
            } else {
               res.status(500).json({ message: 'Internal server error', error: error.message });
            }
             // No explicit return needed
        }
    }

    // Added next: NextFunction and changed return type annotation to Promise<void>
    getEmployees= async(req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const employees = await this.employeeUseCase.getEmployees();
            res.status(200).json(employees); // Send response
        } catch (error: any) {
             console.error('Error in getEmployees controller:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    // Added next: NextFunction and changed return type annotation to Promise<void>
    updateEmployee =async(req: Request, res: Response, next: NextFunction): Promise<void> =>{
        try {
            const id = parseInt(req.params.id, 10);
            const { name, position, salary, updatedBy } = req.body;

            if (!updatedBy) {
                 res.status(400).json({ message: 'UpdatedBy user is required.' });
                 return;
            }

             if (isNaN(id)) {
                 res.status(400).json({ message: 'Invalid employee ID.' });
                 return;
            }

            const updatedEmployee = await this.employeeUseCase.updateEmployee(id, name, position, salary, updatedBy);

             if (!updatedEmployee) {
                 res.status(404).json({ message: `Employee with ID ${id} not found.` });
                 return;
            }

            res.status(200).json(updatedEmployee); // Send response

        } catch (error: any) {
             console.error('Error in updateEmployee controller:', error);
            if (error.message.includes('Invalid employee data')) {
                res.status(400).json({ message: error.message });
            } else if (error.message.includes('not found for update') || (error as any).statusCode === 404) {
                 res.status(404).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        }
    }

    // Added next: NextFunction and changed return type annotation to Promise<void>
    deleteEmployee=async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
        try {
            const id = parseInt(req.params.id, 10);
             const { deletedBy } = req.body;

             if (!deletedBy) {
                 res.status(400).json({ message: 'DeletedBy user is required.' });
                 return;
            }

             if (isNaN(id)) {
                 res.status(400).json({ message: 'Invalid employee ID.' });
                 return;
            }

            await this.employeeUseCase.deleteEmployee(id, deletedBy);
            res.status(204).send(); // Send response

        } catch (error: any) {
             console.error('Error in deleteEmployee controller:', error);
             if (error.message.includes('Invalid data provided for deletion')) {
                 res.status(400).json({ message: error.message });
            } else if (error.message.includes('not found for deletion') || (error as any).statusCode === 404) {
                 res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        }
    }

    // Added next: NextFunction and changed return type annotation to Promise<void>
    getEmployeesBySalaryRange= async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
        try {
            const minSalary = parseFloat(req.query.minSalary as string);
            const maxSalary = parseFloat(req.query.maxSalary as string);

            if (isNaN(minSalary) || isNaN(maxSalary)) {
                 res.status(400).json({ message: 'Invalid minSalary or maxSalary provided.' });
                 return;
            }

            const employees = await this.employeeUseCase.getEmployeesBySalaryRange(minSalary, maxSalary);
            res.status(200).json(employees); // Send response

        } catch (error: any) {
             console.error('Error in getEmployeesBySalaryRange controller:', error);
             if (error.message.includes('Invalid salary range')) {
                 res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        }
    }
}