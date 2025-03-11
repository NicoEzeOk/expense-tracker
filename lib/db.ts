import { supabase } from './supabase'
import { Transaction, NewTransaction } from '@/types/transaction'

export async function fetchTransactions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error.message)
      throw new Error(error.message)
    }

    return (data || []) as Transaction[]
  } catch (error) {
    console.error('Error in fetchTransactions:', error)
    throw error
  }
}

export async function createTransaction(transaction: NewTransaction, userId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: userId }])
      .select()
      .single()

    if (error) {
      console.error('Error creating transaction:', error.message)
      throw new Error(error.message)
    }

    return data as Transaction
  } catch (error) {
    console.error('Error in createTransaction:', error)
    throw error
  }
}

export async function updateTransaction(id: string, transaction: Partial<NewTransaction>) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating transaction:', error.message)
      throw new Error(error.message)
    }

    return data as Transaction
  } catch (error) {
    console.error('Error in updateTransaction:', error)
    throw error
  }
}

export async function deleteTransaction(id: string) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting transaction:', error.message)
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Error in deleteTransaction:', error)
    throw error
  }
} 