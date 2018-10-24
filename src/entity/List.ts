import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable} from "typeorm";
import {User} from "./User";
import {Item} from "./Item";

@Entity()
export class List {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => User, owner => owner.owner_list, {cascade: true})
    owner: User;

    @OneToMany(type => Item, item => item.list) // note: we will create author property in the Photo class below
    items: Item[];

    @Column("timestamp", { precision: 3, default: () => "CURRENT_TIMESTAMP(3)"})
    createAt: Date;

    @Column("timestamp", { precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    updateAt: Date;

    @ManyToMany(type => User, user => user.users_list, {cascade: true})
    @JoinTable()
    users: User[];

    @ManyToMany(type => User, user => user.watcher_list, {cascade: true})
    @JoinTable()
    watchers: User[];

}
