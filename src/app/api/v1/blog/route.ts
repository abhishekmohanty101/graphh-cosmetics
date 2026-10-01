import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET() { return successResponse({ posts: [], categories: [], tags: [] }) }
