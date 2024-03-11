import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Or, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {
    }

    async clearAll() {
        this.userRepository.clear();
    }

    async createUser(username: string, email: string, password: string) {
        const user = this.userRepository.create({username: username.toLowerCase(), email: email.toLowerCase(), password});
        const {id} = await this.userRepository.save(user);
        return {username, id}; 
    }

    async findOne(username: string): Promise<User | undefined> {
        const usernames = await this.userRepository.find();
        return this.userRepository.findOne({where:{username}})
    }

    async isEmailExist(email: string){
        return await this.userRepository.exists({where:{email}});
    }

    async findById(id: string): Promise<User | undefined> {
        return this.userRepository.findOneBy({id})
    }
}