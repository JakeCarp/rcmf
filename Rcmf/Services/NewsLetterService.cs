namespace Rcmf.Services;

public class NewsletterService
{
  private readonly NewsletterRepository _newsletterRepo;
  private readonly AccountService _accountsService;

  public NewsletterService(NewsletterRepository newsletterRepo, AccountService accountsService)
  {
    _newsletterRepo = newsletterRepo;
    _accountsService = accountsService;
  }

  internal Newsletter CreateNewsletter(Newsletter newsletterData)
  {
    return _newsletterRepo.Create(newsletterData);
  }
}