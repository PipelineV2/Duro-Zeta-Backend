// /* eslint-disable prefer-const */
// interface User {
//     id: string;
//     name: string;
//   }
  
//   let queue: User[] = [];
  
//   export function updateQueue(userId: string, attended: boolean): void {
//     // Find the user in the queue by their ID
//     const userIndex = queue.findIndex((user) => user.id === userId);
  
//     if (attended) {
//       // If the user is attended, move them to the front of the queue
//       if (userIndex !== -1) {
//         const [user] = queue.splice(userIndex, 1);
//         queue.unshift(user);
//       }
//     } else {
//       // If the user is not attended, remove them from the queue
//       if (userIndex !== -1) {
//         queue.splice(userIndex, 1);
//       }
//     }
//   }
  
//   export function removeUserFromQueue(userId: string): void {
//     // Remove the user from the queue by their ID
//     const userIndex = queue.findIndex((user) => user.id === userId);
  
//     if (userIndex !== -1) {
//       queue.splice(userIndex, 1);
//     }
//   }
  
//   export function getQueue(): User[] {
//     // Return a copy of the queue
//     return [...queue];
//   }
  