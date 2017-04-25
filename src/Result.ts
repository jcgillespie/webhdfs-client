export class Outcome {
    Success: boolean;
}

export class Result<TValue> extends Outcome {
    Result?: TValue;
}
