namespace Splitzy.Database.Repositories;

public interface IRepository<TEntity> where TEntity : class
{
    Task<ICollection<TEntity>> GetAllAsync();
    Task<bool> SaveAsync();
    IQueryable<TEntity> GetQueryable(bool asNoTracking = true);
    Task<TEntity> GetByIdAsync(object id);
    Task<TEntity> InsertAsync(TEntity entity);
    Task<TEntity> UpdateAsync(TEntity entity);
    Task DeleteAsync(TEntity entity);
    Task<bool> ExistAsync(object id);
}
