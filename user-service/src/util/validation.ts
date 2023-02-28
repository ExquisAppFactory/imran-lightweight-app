import { Response, Request } from "express";
import { ObjectSchema } from "joi";

export const validateRequest = (
  req: Request,
  res: Response,
  rules: ObjectSchema,
  onSucceed: () => void
) => {
  const validationResult = rules.validate(req.body, { abortEarly: false });

  if (validationResult.error) {
    (res as any).failValidationError(
      validationResult.error.details.map((m) => m.message.replace(/"/g, "")),
      "validation-error"
    );
  } else {
    onSucceed();
  }
};
