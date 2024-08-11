// document.addEventListener('DOMContentLoaded', () => {
//     const form = document.getElementById('attendance-form');
    
//     // Attach click event to all SVG icons
//     document.querySelectorAll('.toggle-icon').forEach(svg => {
//         svg.addEventListener('click', () => {
//             // Toggle the status between present (1) and absent (0)
//             const isPresent = svg.getAttribute('data-status') === '1';
//             const newStatus = isPresent ? '0' : '1';
//             const registrationNumber = svg.getAttribute('data-registration-number');

//             // Update SVG color and icon based on status
//             const iconPath = svg.querySelector('.icon-path');
//             if (newStatus === '1') {
//                 iconPath.setAttribute('d', 'M6.116 14.884c.488.488 1.28.488 1.768 0l10-10c.488-.488.488-1.28 0-1.768s-1.28-.488-1.768 0l-9.08 9.15-4.152-4.15c-.488-.488-1.28-.488-1.768 0s-.488 1.28 0 1.768l5 5z');
//                 iconPath.setAttribute('fill', 'limegreen');
//             } else {
//                 iconPath.setAttribute('d', 'M4.22 4.22c-.488-.488-1.28-.488-1.768 0s-.488 1.28 0 1.768l4.15 4.15-4.15 4.15c-.488.488-.488 1.28 0 1.768s1.28.488 1.768 0l4.15-4.15 4.15 4.15c.488.488 1.28.488 1.768 0s.488-1.28 0-1.768l-4.15-4.15 4.15-4.15c.488-.488.488-1.28 0-1.768s-1.28-.488-1.768 0l-4.15 4.15-4.15-4.15z');
//                 iconPath.setAttribute('fill', 'red');
//             }
            
//             // Update or add hidden input for this student's attendance
//             let hiddenInput = form.querySelector(`input[name="attendance[${registrationNumber}]"]`);
//             if (!hiddenInput) {
//                 hiddenInput = document.createElement('input');
//                 hiddenInput.type = 'hidden';
//                 hiddenInput.name = `attendance[${registrationNumber}]`;
//                 form.appendChild(hiddenInput);
//             }
//             hiddenInput.value = newStatus;
//         });
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('attendance-form');

    // Attach click event to all SVG icons
    document.querySelectorAll('.toggle-icon').forEach(svg => {
        svg.addEventListener('click', () => {
            // Toggle the status between present (1) and absent (0)
            const isPresent = svg.getAttribute('data-status') === '1';
            const newStatus = isPresent ? '0' : '1';
            const registrationNumber = svg.getAttribute('data-registration-number');

            // Update SVG color and icon based on status
            const iconPath = svg.querySelector('.icon-path');
            if (newStatus === '1') {
                iconPath.setAttribute('d', 'M6.116 14.884c.488.488 1.28.488 1.768 0l10-10c.488-.488.488-1.28 0-1.768s-1.28-.488-1.768 0l-9.08 9.15-4.152-4.15c-.488-.488-1.28-.488-1.768 0s-.488 1.28 0 1.768l5 5z');
                iconPath.setAttribute('fill', 'limegreen');
            } else {
                iconPath.setAttribute('d', 'M4.22 4.22c-.488-.488-1.28-.488-1.768 0s-.488 1.28 0 1.768l4.15 4.15-4.15 4.15c-.488.488-.488 1.28 0 1.768s1.28.488 1.768 0l4.15-4.15 4.15 4.15c.488.488 1.28.488 1.768 0s.488-1.28 0-1.768l-4.15-4.15 4.15-4.15c.488-.488.488-1.28 0-1.768s-1.28-.488-1.768 0l-4.15 4.15-4.15-4.15z');
                iconPath.setAttribute('fill', 'red');
            }

            // Update the data-status attribute to reflect the new status
            svg.setAttribute('data-status', newStatus);

            // Update or add hidden input for this student's attendance
            let hiddenInput = form.querySelector(`input[name="attendance[${registrationNumber}]"]`);
            if (!hiddenInput) {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = `attendance[${registrationNumber}]`;
                form.appendChild(hiddenInput);
            }
            hiddenInput.value = newStatus;
        });
    });
});


