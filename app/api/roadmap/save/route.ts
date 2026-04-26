import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const ROADMAP_FILE = join(process.cwd(), 'public', 'roadmap.json')

export async function POST(request: NextRequest) {
  try {
    const roadmap = await request.json()

    if (!roadmap || !roadmap.phases) {
      return NextResponse.json(
        { error: 'Invalid roadmap data' },
        { status: 400 }
      )
    }

    // Validate roadmap data
    for (const phase of roadmap.phases) {
      if (!phase.title || !phase.id) {
        return NextResponse.json(
          { error: 'Each phase must have an id and title' },
          { status: 400 }
        )
      }
    }

    // Save to public/roadmap.json
    await writeFile(ROADMAP_FILE, JSON.stringify(roadmap, null, 2))

    return NextResponse.json(
      { message: 'Roadmap saved successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving roadmap:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
