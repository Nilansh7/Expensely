import { create } from 'zustand';
import uuid from 'react-native-uuid';

type Member = {
  id: string;
  name: string;
};

type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
};

type Group = {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
};

type Store = {
  groups: Group[];
  addGroup: (name: string) => void;
  addMember: (groupId: string, memberName: string) => void;
  addExpense: (groupId: string, expense: Expense) => void;
};

export const useStore = create<Store>((set) => ({
  groups: [],
  addGroup: (name) =>
    set((state) => ({
      groups: [
        ...state.groups,
        {
          id: uuid.v4() as string,
          name,
          members: [],
          expenses: [],
        },
      ],
    })),
  addMember: (groupId, memberName) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: [
                ...group.members,
                { id: uuid.v4() as string, name: memberName },
              ],
            }
          : group
      ),
    })),
  addExpense: (groupId, expense) =>
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              expenses: [...group.expenses, expense],
            }
          : group
      ),
    })),
}));
