
import { Router, Request, Response  } from 'express';
import { EmployeeController } from '../controllers/EmployeeController';
import { EmployeeUseCase } from '../core/usecase/EmployeeUseCase';
import { EmployeeRepository } from '../infrastructure/repositories/EmployeeRepository';

// --- Dependency Injection Setup (Simplified, located here) ---
const employeeRepository = new EmployeeRepository();
const employeeUseCase = new EmployeeUseCase(employeeRepository);
const employeeController = new EmployeeController(employeeUseCase);



const router = Router();

router.post('/', employeeController.createEmployee); 
router.get('/', employeeController.getEmployees);   
router.put('/:id', employeeController.updateEmployee); 
router.delete('/:id', employeeController.deleteEmployee); 
router.get('/salary-range', employeeController.getEmployeesBySalaryRange); 



export default router;   