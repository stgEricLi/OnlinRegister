using AutoMapper;
using OnlineRegister.DTOs;
using OnlineRegister.Models;

namespace OnlineRegister.Configurations;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        // User mappings
        // RegisterDto = Source type (what you're converting FROM)
        // User = Destination type (what you're converting TO)
        CreateMap<RegisterDto, User>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => "User")) // Default role
            .ForMember(dest => dest.UserID, opt => opt.Ignore()) // Auto-generated
            .ForMember(dest => dest.Salt, opt => opt.Ignore()) // Handle separately
            .ForMember(dest => dest.Password, opt => opt.Ignore()); // Handle separately

        // User = Source type (what you're converting FROM)
        // UserResponseDto = Destination type (what you're converting TO)
        CreateMap<User, UserResponseDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.UserID.ToString()))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email ?? string.Empty))
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role));

        // Add more mappings as needed
    }
}