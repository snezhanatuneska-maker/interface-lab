import { TOOLS } from '../data/subtopics'
import { TRAINERS } from '../data/trainers'
import { REPO_URL } from '../siteConfig'

// About (#/about): what the site is, who made it, and where to send feedback. Keep it to one screen on desktop.

export default function AboutPage() {
  return (
    <article className="page about">
      <header className="page-intro">
        <h1>About</h1>
        <p className="lede">
          Interactive simulators and practice tools for Interface Engineering in Clean Energy Processes (CEP), built to
          help students visualise the concepts from the course.
        </p>
      </header>

      <dl className="about-list">
        <div>
          <dt>Course</dt>
          <dd>
            Interface Engineering (Prof. Klupp) <span className="tag accent">[TO CONFIRM]</span>
          </dd>
        </div>
        <div>
          <dt>Made by</dt>
          <dd>Snezhana Tuneska and Aysenur Gubur, CEP students</dd>
        </div>
        <div>
          <dt>On the site</dt>
          <dd>
            <a href="#/demos">{TOOLS.length} demos</a>: interactive simulators, one per course subtopic, grouped by topic.{' '}
            <a href="#/training">{TRAINERS.length} trainers</a>: randomized practice problems with worked solutions and an
            exam mode.
          </dd>
        </div>
        <div>
          <dt>Inspiration</dt>
          <dd>
            The structure follows FAU’s{' '}
            <a href="https://lms-spt.e-technik.uni-erlangen.de/" target="_blank" rel="noopener noreferrer">
              Signal Processing Toolkit
            </a>
            .
          </dd>
        </div>
        <div>
          <dt>Source and feedback</dt>
          <dd>
            The code is on{' '}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            . Found a mistake or have an idea?{' '}
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
              Open an issue
            </a>
            .
          </dd>
        </div>
      </dl>
    </article>
  )
}
