/**
 * Categories eligible for virtual / online-only delivery.
 * Used to show a "Virtual" badge and filter option.
 */

const VIRTUAL_ELIGIBLE_CATEGORIES = [
  'ACADEMIC_TUTORING',
  'WRITING_HELP',
  'RESEARCH_STUDY_HELP',
  'TECH_DIGITAL',
  'CAREER_SELF_GROWTH',
];

function isVirtualEligible(categoryId) {
  return VIRTUAL_ELIGIBLE_CATEGORIES.includes(categoryId);
}

module.exports = { VIRTUAL_ELIGIBLE_CATEGORIES, isVirtualEligible };
