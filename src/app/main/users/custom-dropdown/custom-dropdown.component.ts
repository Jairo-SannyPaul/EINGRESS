import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-custom-dropdown',
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.css']
})
export class CustomDropdownComponent {

  userForm: FormGroup;

  // Dropdown state
  isDropdownOpen = false;
  selectedRole: string | null = null; // Holds the selected role
  roles: string[] = [ // List of roles
    "Admin Aide",
    "Administrative Assistant",
    "Administrative Officer",
    "Back End Developer",
    "Bubble Developer",
    "CAD Operator",
    "Cebu Branch Manager",
    "Chief Executive Officer",
    "Chief Finance Officer",
    "Co-CEO",
    "Database Administrator",
    "Developer",
    "DevOps Engineer",
    "Digital Creative Marketing",
    "Driver/ Maintenance",
    "Front-end Developer",
    "Full Stack Developer",
    "Guest",
    "HR and Recruitment Assistant",
    "HR Consultant",
    "Intern",
    "Internal Finance",
    "IT Administrator",
    "Junior Full Stack Developer",
    "Lead UI/UX Designer",
    "Liaison Officer",
    "Logistics",
    "Logistics Assistant",
    "Maintenance Worker",
    "PMO Manager",
    "Principal Development Supervisor",
    "Product Design Manager",
    "Product Owner",
    "Project Coordinator",
    "Project Manager",
    "QA Manager",
    "Quality Assurance Specialist",
    "Quality Assurance Specialist - Team Lead",
    "Quality Automation Supervisor",
    "Scrum Master",
    "Scrum Master/Product Owner",
    "Software Development Manager",
    "Sr. Full Stack Developer",
    "TVI Head",
    "UI/UX Designer"
  ];

  constructor(private fb: FormBuilder) {
    // Initialize the form
    this.userForm = this.fb.group({
      role: [''] // Form control for role
    });
  }

  // Method to toggle the dropdown visibility
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Method to select a role from the dropdown
  selectRole(role: string) {
    this.selectedRole = role; // Set the selected role
    this.isDropdownOpen = false; // Close the dropdown
    this.userForm.get('role')?.setValue(role); // Update the form control with the selected role
  }

  // Optional: Method to close the dropdown when clicking outside (if needed)
  closeDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isDropdownOpen = false; // Close if click is outside
    }
  }

}
