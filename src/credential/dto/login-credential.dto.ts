import { IsString, MinLength } from "class-validator";

export class loginCredentialDto{
    
    @IsString()
    @MinLength(5)
    public readonly user:string;

    @IsString()
    @MinLength(8)
    public readonly password:string;
}