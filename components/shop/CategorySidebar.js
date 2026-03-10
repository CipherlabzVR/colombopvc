"use client";

function PlusMinusIcon({ expanded }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M2 7h10" />
      {!expanded && <path d="M7 2v10" />}
    </svg>
  );
}

/**
 * Categories from API: { categoryId, categoryName, itemCount, subCategories: [{ subCategoryId, subCategoryName, itemCount }] }
 * Selection is by ID (categoryId, subCategoryId).
 */
export default function CategorySidebar({
  categories = [],
  expandedCategoryId,
  selectedCategoryId,
  selectedSubCategoryId,
  onCategoryClick,
  onSubcategoryClick,
  onClearFilters,
  loading,
}) {
  return (
    <aside className="w-full lg:w-[280px] shrink-0">
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Categories
            </p>
            <p className="text-sm font-semibold text-slate-800">
              Shop by category
            </p>
          </div>
          <button
            type="button"
            onClick={onClearFilters}
            disabled={loading}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2 disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-center text-slate-500 text-sm">
            Loading categories…
          </div>
        ) : (
          <nav className="max-h-[70vh] overflow-y-auto scrollbar-hide">
            {categories.map((cat) => {
              const isExpanded = expandedCategoryId === cat.categoryId;
              const isSelected = selectedCategoryId === cat.categoryId;
              const subCategories = Array.isArray(cat.subCategories) ? cat.subCategories : [];

              return (
                <div key={cat.categoryId} className="border-b border-slate-100 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onCategoryClick(cat.categoryId)}
                    className={[
                      "w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                    aria-expanded={isExpanded}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={[
                          "w-2.5 h-2.5 rounded-full border shrink-0",
                          isSelected
                            ? "bg-[#FACC15] border-[#FACC15]"
                            : "bg-white border-slate-300",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      <span className="truncate">{cat.categoryName}</span>
                    </span>
                    <span className="text-slate-500">
                      <PlusMinusIcon expanded={isExpanded} />
                    </span>
                  </button>

                  {isExpanded && subCategories.length > 0 && (
                    <div className="pb-2">
                      {subCategories.map((sub) => {
                        const isSubSelected =
                          isSelected && selectedSubCategoryId === sub.subCategoryId;

                        return (
                          <button
                            key={sub.subCategoryId}
                            type="button"
                            onClick={() => onSubcategoryClick(cat.categoryId, sub.subCategoryId)}
                            className={[
                              "w-full px-4 pl-10 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                              isSubSelected
                                ? "text-[#1f2937] bg-[#FACC15]/20 font-semibold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "w-2 h-2 rounded-full border shrink-0",
                                isSubSelected
                                  ? "bg-emerald-600 border-emerald-600"
                                  : "bg-white border-slate-300",
                              ].join(" ")}
                              aria-hidden="true"
                            />
                            <span className="truncate">{sub.subCategoryName}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}
