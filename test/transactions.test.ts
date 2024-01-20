import { execSync } from 'node:child_process'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('o usuário consegui criar uma nova transação', async () => {
    // Fazer a chamada HTTP p/ criar uma nova transação
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 1000,
      type: 'credit',
    })

    expect(response.statusCode).toEqual(201)
  })

  it('o usuário consegue listar as transações', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 1000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body).toEqual([
      expect.objectContaining({
        title: 'New Transaction',
        amount: 1000,
      }),
    ])
  })

  it('o usuário consegue listar especifica transação', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 1000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionsResponse.body[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body).toEqual(
      expect.objectContaining({
        title: 'New Transaction',
        amount: 1000,
      }),
    )
  })

  it('o usuário consegue listar o resumo', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit Transaction',
        amount: 5000,
        type: 'credit',
      })
    const cookies = createTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit Transaction',
        amount: 2000,
        type: 'debit',
      })

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body).toEqual({
      amount: 3000,
    })
  })
})
