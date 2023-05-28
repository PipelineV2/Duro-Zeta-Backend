import jwt from "jsonwebtoken";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

export {
  generateToken,
};
