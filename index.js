const inquirer = require('inquirer');
const connection = require('./db/connection');
const figlet = require('figlet');


function showHeader() {
    console.log(figlet.textSync('Employee Manager', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }));
}

// This starts application and should show the start menu
function mainMenu() {
    showHeader();
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update an Employee Role',
                'Update an employee Manger',
                'Delete an Employee',
                'Exit'
            ]
        }
    ]).then(answers => {
        switch (answers.action) {
            case 'View All Departments':
                viewDepartments();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'View All Employees':
                viewEmployees();
                break;
            case 'Add a Department':
                addDepartment();
                break;
            case 'Add a Role':
                addRole();
                break;
            case 'Add an Employee':
                addEmployee();
                break;
            case 'Update an Employee Role':
                updateEmployeeRole();
                break;
            case 'Update an Employee Manager':
                updateEmployeeManager();
                break;
            case 'Delete an Employee':
                deleteEmployee();
                break;
            case 'Exit':
                connection.end();
                break;
        }
    });
}

function viewDepartments() {
    connection.query('SELECT * FROM departments', (err, results) => {
        if (err) throw err;
        console.table(results);
        mainMenu();
    });
}

function viewRoles() {
    connection.query('SELECT * FROM roles', (err, results) => {
        if (err) throw err;
        console.table(results);
        mainMenu();
    });
}

function viewEmployees() {
    connection.query('SELECT * FROM employees', (err, results) => {
        if (err) throw err;
        console.table(results);
        mainMenu();
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'Which department?',
            validate: function (input) {
                if (input.trim() === '') {
                    return 'Please enter the correct department name.';
                }
                return true;
            }
        }
    ]).then(answer => {
        connection.query('INSERT INTO departments (name) VALUES (?)', [answer.departmentName], (err, results) => {
            if (err) throw err;
            console.log(`${answer.departmentName} department added.`);
            mainMenu();
        });
    });
}

function addRole() {
    connection.query('SELECT * FROM departments', (err, departments) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'input',
                name: 'roleTitle',
                message: 'What is the title of the role?',
                validate: function (input) {
                    if (input.trim() === '') {
                        return 'Please enter a valid role title.';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'roleSalary',
                message: 'What is the salary for this role?',
                validate: function (input) {
                    if (isNaN(input) || input.trim() === '') {
                        return 'Please enter a valid salary.';
                    }
                    return true;
                }
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Which department does this role belong to?',
                choices: departments.map(department => ({ name: department.name, value: department.id }))
            }
        ]).then(answers => {
            connection.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)',
                [answers.roleTitle, answers.roleSalary, answers.departmentId],
                (err) => {
                    if (err) throw err;
                    console.log(`${answers.roleTitle} role added successfully.`);
                    mainMenu();
                });
        });
    });
}

function addEmployee() {
    connection.query('SELECT * FROM roles', (err, roles) => {
        if (err) throw err;

        connection.query('SELECT * FROM employees', (err, employees) => {
            if (err) throw err;

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: "What is the employee's first name?",
                    validate: function (input) {
                        if (input.trim() === '') {
                            return 'Please enter a first name.';
                        }
                        return true;
                    }
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: "What is the employee's last name?",
                    validate: function (input) {
                        if (input.trim() === '') {
                            return 'Please enter a last name.';
                        }
                        return true;
                    }
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: "What is the employee's role?",
                    choices: roles.map(role => ({ name: role.title, value: role.id }))
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: "Who is the employee's manager?",
                    choices: [{ name: 'None', value: null }].concat(
                        employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }))
                    )
                }
            ]).then(answers => {
                connection.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
                    [answers.firstName, answers.lastName, answers.roleId, answers.managerId],
                    (err) => {
                        if (err) throw err;
                        console.log(`${answers.firstName} ${answers.lastName} added as a new employee.`);
                        mainMenu();
                    });
            });
        });
    });
}
function updateEmployeeRole() {
    connection.query('SELECT * FROM employees', (err, employees) => {
        if (err) throw err;

        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        // Add 'Exit to Main Menu' option here
        employeeChoices.push({
            name: 'Exit to Main Menu',
            value: 'exit'
        });

        connection.query('SELECT * FROM roles', (err, roles) => {
            if (err) throw err;

            const roleChoices = roles.map(role => ({
                name: role.title,
                value: role.id
            }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: 'Which employee\'s role do you want to update?',
                    choices: employeeChoices
                }
            ]).then(answers => {
                if (answers.employeeId === 'exit') {
                    mainMenu();
                    return; 
                }

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'roleId',
                        message: 'Which role do you want to assign to the selected employee?',
                        choices: roleChoices
                    }
                ]).then(roleAnswers => {
                    connection.query('UPDATE employees SET role_id = ? WHERE id = ?',
                        [roleAnswers.roleId, answers.employeeId],
                        (updateErr) => {
                            if (updateErr) throw updateErr;
                            console.log('Employee role updated successfully.');
                            mainMenu();
                        }
                    );
                });
            });
        });
    });
}

function updateEmployeeManager() {
    connection.query('SELECT * FROM employees', (err, employees) => {
        if (err) throw err;

        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Which employee\'s manager do you want to update?',
                choices: employeeChoices
            },
            {
                type: 'list',
                name: 'managerId',
                message: 'Who is the new manager?',
                choices: [{ name: 'None', value: null }].concat(employeeChoices)
            }
        ]).then(answers => {
            connection.query('UPDATE employees SET manager_id = ? WHERE id = ?',
                [answers.managerId, answers.employeeId],
                (err) => {
                    if (err) throw err;
                    console.log('Employee manager updated successfully.');
                    mainMenu(); 
                }
            );
        });
    });
}

function deleteEmployee() {
    connection.query('SELECT * FROM employees', (err, employees) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Which employee would you like to delete?',
                choices: employees.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })),
            },
            {
                type: 'confirm',
                name: 'confirmDelete',
                message: 'Are you sure you want to delete this employee?',
                default: false
            }
        ]).then(answers => {
            if (answers.confirmDelete) {
                connection.query('UPDATE employees SET manager_id = NULL WHERE manager_id = ?', [answers.employeeId], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating employees:', updateErr);
                        return mainMenu();
                    }
                    
                    connection.query('DELETE FROM employees WHERE id = ?', [answers.employeeId], (deleteErr) => {
                        if (deleteErr) throw deleteErr;
                        console.log('Employee deleted successfully.');
                        mainMenu();
                    });
                });
            } else {
                console.log('Employee deletion cancelled.');
                mainMenu();
            }
        });
    });
}

mainMenu();










