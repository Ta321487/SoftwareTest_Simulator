import { glossaryTerms } from '../data/glossary'
import { playbooks } from '../data/playbooks'

export function getTermsForLevel(levelId) {
  return glossaryTerms.filter((t) => t.relatedLevelIds?.includes(levelId))
}

export function getPlaybooksForLevel(levelId) {
  return playbooks.filter((p) => p.relatedLevelIds?.includes(levelId))
}

export function getHandbookLinksForLevel(levelId) {
  return {
    terms: getTermsForLevel(levelId),
    playbooks: getPlaybooksForLevel(levelId),
  }
}

export function getPlaybooksForTerm(termId) {
  return playbooks.filter((p) => p.relatedTermIds?.includes(termId))
}
