import { Request } from "express";

export interface IRequest extends Request {
	decoded?: {
		role?: string,
		id?: string
	};
}
