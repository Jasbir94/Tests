import prisma from './prisma'

export async function getOrCreateMockUser() {
  const email = 'mock_user@example.com'
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Mock User'
      }
    })
  }
  return user
}
