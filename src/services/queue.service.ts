import { v4 as uuidv4 }  from "uuid";

const userId = uuidv4();

const joinQueue = (userId: string): string[] => {
  const queue = [...userId, "newUsrId"];
  return queue
}

export {
  joinQueue
}